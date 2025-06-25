from flask import Blueprint, request, jsonify, current_app, session
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from .models import User
from app.extensions import db
from .services import send_verification_email, generate_code, send_admin_credentials_email
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

@auth_bp.route('/request-reset', methods=['POST'])
def request_reset():
    email = request.json.get('email')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Email non trouvé"}), 404
    
    code = generate_code()
    user.verification_code = code
    db.session.commit()
    
    # Stocker l'email dans la session pour les étapes suivantes
    session['reset_email'] = email
    
    send_verification_email(email, code)
    return jsonify({"message": "Code envoyé"}), 200

@auth_bp.route('/verify-code', methods=['POST'])
def verify_code():
    code = request.json.get('code')
    
    # Récupérer l'email de la session
    email = session.get('reset_email')
    if not email:
        return jsonify({"error": "Aucune demande de réinitialisation en cours"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or user.verification_code != code:
        return jsonify({"error": "Code invalide"}), 400
    
    # Marquer le code comme vérifié
    session['code_verified'] = True
        
    return jsonify({"message": "Code valide"}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    new_password = request.json.get('new_password')
    confirm_password = request.json.get('confirm_password')

    # Vérifier que la session contient les informations nécessaires
    email = session.get('reset_email')
    code_verified = session.get('code_verified')
    
    if not email or not code_verified:
        return jsonify({"error": "Veuillez d'abord vérifier votre code"}), 400

    # Vérifier que les deux mots de passe correspondent
    if new_password != confirm_password:
        return jsonify({"error": "Les mots de passe ne correspondent pas"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Utilisateur non trouvé"}), 404

    user.set_password(new_password)
    user.verification_code = None
    db.session.commit()
    
    # Nettoyer la session
    session.pop('reset_email', None)
    session.pop('code_verified', None)
    
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


#statistique pour admin
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
