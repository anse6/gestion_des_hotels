from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from .models import User
from app.extensions import db
from .services import (
    send_password_reset_email, generate_reset_token, 
    send_admin_credentials_email, send_user_credentials_email
)
import logging

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
   
    # Vérifier si l'email existe déjà
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Cet email est déjà utilisé"}), 400
       
    user = User(
        name=data['name'],
        email=data['email'],
        role='user'
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    
    # Envoyer l'email avec les identifiants
    send_user_credentials_email(data['email'], data['password'])
    
    return jsonify({"message": "Compte utilisateur créé"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
   
    # Logging pour debug
    current_app.logger.info(f"Tentative de connexion avec email: {data.get('email')}")
   
    user = User.query.filter_by(email=data.get('email')).first()
   
    if not user:
        current_app.logger.warning(f"Utilisateur non trouvé: {data.get('email')}")
        return jsonify({"error": "Identifiants invalides"}), 401
       
    if not user.check_password(data.get('password')):
        current_app.logger.warning(f"Mot de passe incorrect pour: {data.get('email')}")
        return jsonify({"error": "Identifiants invalides"}), 401
       
    if not user.is_active:
        current_app.logger.warning(f"Compte inactif: {data.get('email')}")
        return jsonify({"error": "Compte désactivé"}), 401
   
    # Connexion réussie
    token = create_access_token(identity=user.email)
    current_app.logger.info(f"Connexion réussie pour: {user.email}, rôle: {user.role}")
    return jsonify({
        "token": token,
        "role": user.role,
        "name": user.name,
        "email": user.email
    }), 200

@auth_bp.route('/admin/create', methods=['POST'])
@jwt_required()
def create_admin():
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

    data = request.get_json()
   
    # Vérifier si l'email existe déjà
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Cet email est déjà utilisé"}), 400
       
    admin = User(
        name=data['name'],
        email=data['email'],
        role='admin'
    )
    admin.set_password(data['password'])
    db.session.add(admin)
    db.session.commit()
   
    # Envoyer un email de confirmation avec les identifiants
    send_admin_credentials_email(data['email'], data['password'])
   
    return jsonify({"message": "Admin créé avec succès"}), 201

@auth_bp.route('/admin', methods=['GET'])
@jwt_required()
def get_admins():
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

    admins = User.query.filter_by(role='admin').all()
    return jsonify([{"id": a.id, "name": a.name, "email": a.email, "is_active": a.is_active} for a in admins])

@auth_bp.route('/admin/<int:id>', methods=['PUT'])
@jwt_required()
def update_admin(id):
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

    data = request.get_json()
    admin = User.query.get_or_404(id)
   
    # Vérifier que nous modifions bien un admin
    if admin.role != 'admin':
        return jsonify({"error": "L'utilisateur n'est pas un admin"}), 400
   
    # Vérifier si le nouvel email existe déjà et n'appartient pas à cet admin
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user and existing_user.id != id:
        return jsonify({"error": "Cet email est déjà utilisé"}), 400
   
    admin.name = data['name']
    admin.email = data['email']
   
    if 'is_active' in data:
        admin.is_active = data['is_active']
       
    if 'password' in data and data['password']:
        admin.set_password(data['password'])
       
    db.session.commit()
    return jsonify({"message": "Admin mis à jour avec succès"})

@auth_bp.route('/admin/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_admin(id):
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

    admin = User.query.get_or_404(id)
   
    # Vérifier que nous supprimons bien un admin
    if admin.role != 'admin':
        return jsonify({"error": "L'utilisateur n'est pas un admin"}), 400
       
    db.session.delete(admin)
    db.session.commit()
    return jsonify({"message": "Admin supprimé avec succès"})

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Nouvelle route pour mot de passe oublié avec token"""
    email = request.json.get('email')
    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({"error": "Email non trouvé"}), 404
   
    # Générer un token de réinitialisation
    token = generate_reset_token()
    user.reset_token = token
    db.session.commit()
   
    # Envoyer l'email avec le template professionnel
    send_password_reset_email(email, token)
    
    return jsonify({"message": "Email de réinitialisation envoyé"}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Réinitialiser le mot de passe avec le token"""
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')

    if not token:
        return jsonify({"error": "Token manquant"}), 400

    if not new_password or not confirm_password:
        return jsonify({"error": "Mots de passe manquants"}), 400

    # Vérifier que les deux mots de passe correspondent
    if new_password != confirm_password:
        return jsonify({"error": "Les mots de passe ne correspondent pas"}), 400

    # Trouver l'utilisateur avec ce token
    user = User.query.filter_by(reset_token=token).first()
    if not user:
        return jsonify({"error": "Token invalide ou expiré"}), 400

    # Mettre à jour le mot de passe
    user.set_password(new_password)
    user.reset_token = None  # Supprimer le token après utilisation
    db.session.commit()
   
    return jsonify({"message": "Mot de passe réinitialisé avec succès"}), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    return jsonify({
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    })

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    data = request.get_json()
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
   
    # Vérifier le mot de passe actuel
    if not current_user.check_password(data.get('current_password', '')):
        return jsonify({"error": "Mot de passe actuel incorrect"}), 400
   
    # Mettre à jour les informations
    if 'name' in data:
        current_user.name = data['name']
   
    if 'email' in data:
        # Vérifier si l'email existe déjà
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != current_user.id:
            return jsonify({"error": "Cet email est déjà utilisé"}), 400
        current_user.email = data['email']
   
    # Vérifier que les deux mots de passe correspondent si un nouveau mot de passe est fourni
    if 'new_password' in data and data['new_password']:
        if data['new_password'] != data.get('confirm_password', ''):
            return jsonify({"error": "Les mots de passe ne correspondent pas"}), 400
        current_user.set_password(data['new_password'])
   
    db.session.commit()
    return jsonify({"message": "Profil mis à jour avec succès"})

# Statistique pour admin
@auth_bp.route('/admin/count', methods=['GET'])
@jwt_required()
def count_admins():
    current_user = User.query.filter_by(email=get_jwt_identity()).first()

    # Seuls les superadmins peuvent voir ce décompte
    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

    admin_count = User.query.filter_by(role='admin').count()

    return jsonify({
        "total_admins": admin_count
    })

# Modifier un utilisateur (par un superadmin)
@auth_bp.route('/user/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

    data = request.get_json()
    user = User.query.get_or_404(id)

    if 'name' in data:
        user.name = data['name']
   
    if 'email' in data:
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({"error": "Cet email est déjà utilisé"}), 400
        user.email = data['email']
   
    if 'password' in data and data['password']:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify({"message": "Utilisateur mis à jour avec succès"}), 200

# Supprimer un utilisateur (et ses hôtels s'il est admin)
@auth_bp.route('/user/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

    user = User.query.get_or_404(id)

    # Supprimer les hôtels associés si l'utilisateur est un admin
    if user.role == 'admin':
        from app.modules.hotel.models import Hotel  # Ajuste l'import selon ta structure
        hotels = Hotel.query.filter_by(admin_id=user.id).all()
        for hotel in hotels:
            db.session.delete(hotel)

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "Utilisateur et hôtels associés supprimés avec succès"}), 200

# Activer / Désactiver un admin (par superadmin)
@auth_bp.route('/admin/<int:id>/status', methods=['PUT'])
@jwt_required()
def toggle_admin_status(id):
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

    admin = User.query.get_or_404(id)
    if admin.role != 'admin':
        return jsonify({"error": "L'utilisateur n'est pas un admin"}), 400

    data = request.get_json()
    if 'is_active' not in data:
        return jsonify({"error": "Le champ 'is_active' est requis"}), 400

    admin.is_active = data['is_active']
    db.session.commit()
    return jsonify({"message": f"Admin {'activé' if data['is_active'] else 'désactivé'} avec succès"}), 200




# API pour récupérer SEULEMENT les admins actifs
@auth_bp.route('/admin/active', methods=['GET'])
@jwt_required()
def get_active_admins():
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

    active_admins = User.query.filter_by(role='admin', is_active=True).all()
    return jsonify([{"id": a.id, "name": a.name, "email": a.email, "is_active": a.is_active} for a in active_admins])



# API pour compter les utilisateurs (à ajouter)
@auth_bp.route('/user/count', methods=['GET'])
@jwt_required()
def count_users():
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

    user_count = User.query.filter_by(role='user').count()
    return jsonify({"total_users": user_count})

# API pour récupérer tous les utilisateurs (à ajouter)
@auth_bp.route('/user', methods=['GET'])
@jwt_required()
def get_users():
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

    users = User.query.filter_by(role='user').all()
    return jsonify([{"id": u.id, "name": u.name, "email": u.email, "is_active": u.is_active} for u in users])

# API pour statistiques complètes (à ajouter)
@auth_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

   
    active_admins = User.query.filter_by(role='admin', is_active=True).count()

    
    return jsonify({
        "active_admins": active_admins
       
    })

