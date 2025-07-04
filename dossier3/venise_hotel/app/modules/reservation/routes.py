import datetime
from venv import logger
from flask import Blueprint, logging, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, desc, func
from app.extensions import db
from app.modules.auth.models import User
from app.modules.hotel.models import Apartment, EventRoom, Room
from .models import (
    RoomReservation, ApartmentReservation, EventRoomReservation, 
    ReservationStatus
)
from .services import (
    create_room_reservation, send_deletion_confirmation, update_room_reservation, cancel_room_reservation,
    get_room_reservation, search_room_reservations,
    create_apartment_reservation, update_apartment_reservation,
    cancel_apartment_reservation, get_apartment_reservation,
    search_apartment_reservations,
    create_event_room_reservation, update_event_room_reservation,
    cancel_event_room_reservation, get_event_room_reservation,
    search_event_room_reservations
)
from .email_service import send_reservation_notification, send_client_confirmation
from .utils import VALID_PAYMENT_METHODS, VALID_RESERVATION_STATUSES, VALID_EVENT_TYPES

reservation_bp = Blueprint('reservation', __name__, url_prefix='/api/reservations')

def admin_or_owner_required(reservation):
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    
    # Debug critique
    print(f"ADMIN_CHECK - User:{current_user.id} Role:{current_user.role} VS Reservation:{reservation.user_id}")
    
    if not current_user:
        return jsonify({"error": "Authentification requise."}), 401
    
    # Accès total pour les admins
    if current_user.role in ['admin', 'superadmin']:
        print("ADMIN_ACCESS_GRANTED")
        return None
        
    # Gestion des erreurs de données
    if not hasattr(reservation, 'user_id'):
        return jsonify({"error": "Erreur système: Réservation mal configurée"}), 500
        
    # Accès propriétaire
    if reservation.user_id == current_user.id:
        print("OWNER_ACCESS_GRANTED")
        return None
    
    # Message d'erreur détaillé
    return jsonify({
        "error": "Permission denied",
        "details": {
            "required": "admin/owner",
            "your_role": current_user.role,
            "reservation_owner": reservation.user_id,
            "your_id": current_user.id
        }
    }), 403
    
# Endpoint de confirmation
@reservation_bp.route('/confirm/<string:reservation_type>/<int:reservation_id>', methods=['GET'])
@jwt_required()
def confirm_reservation(reservation_type, reservation_id):
    """Endpoint pour confirmer une réservation"""
    try:
        # Vérifier que l'utilisateur est admin
        current_user = User.query.filter_by(email=get_jwt_identity()).first()
        if current_user.role not in ['admin', 'superadmin']:
            return jsonify({"error": "Accès refusé. Droits insuffisants."}), 403

        # Sélection du modèle approprié
        model_mapping = {
            'chambre': RoomReservation,
            'appartement': ApartmentReservation,
            'salle-evenement': EventRoomReservation
        }
        
        if reservation_type not in model_mapping:
            return jsonify({"error": "Type de réservation invalide"}), 400
        
        model = model_mapping[reservation_type]
        
        # Récupération de la réservation
        reservation = model.query.get_or_404(reservation_id)
        
        # Mise à jour du statut
        reservation.statut = ReservationStatus.CONFIRMED
        db.session.commit()
        
        # Envoi de la confirmation au client
        send_client_confirmation(reservation, reservation_type)
        
        return jsonify({
            "status": "success",
            "message": "Réservation confirmée",
            "reservation_id": reservation_id,
            "client_email": reservation.email
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Routes pour les réservations de chambres
@reservation_bp.route('/rooms', methods=['POST'])
@jwt_required()
def add_room_reservation():
    data = request.get_json()
    
    required_fields = ['room_id', 'nom', 'prenom', 'email', 'date_arrivee', 'date_depart', 'nombre_personnes']
    if not all(field in data for field in required_fields):
        return jsonify({"error": f"Champs obligatoires manquants: {', '.join(required_fields)}"}), 400
    
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    
    reservation, error = create_room_reservation(
        data['room_id'],
        data,
        current_user.id if current_user else None
    )
    
    if error:
        return jsonify({"error": error}), 400
    
    # Envoi de la notification à l'admin
    send_reservation_notification(reservation, 'chambre')
    
    return jsonify({
        "message": "Réservation de chambre créée avec succès",
        "reservation": {
            "id": reservation.id,
            "nom": reservation.nom,
            "prenom": reservation.prenom,
            "dates": f"{reservation.date_arrivee} au {reservation.date_depart}",
            "prix_total": reservation.prix_total,
            "statut": reservation.statut
        }
    }), 201
    
    
    
    



@reservation_bp.route('/rooms/<int:reservation_id>', methods=['PUT'])
@jwt_required()
def modify_room_reservation(reservation_id):
    try:
        reservation = RoomReservation.query.get_or_404(reservation_id)
        current_user = User.query.filter_by(email=get_jwt_identity()).first()

        print(f"[DEBUG] User:{current_user.id} Role:{current_user.role}")
        print(f"[DEBUG] Reservation User ID:{reservation.user_id}")

        # Vérification des droits
        if current_user.role not in ['admin', 'superadmin']:
            if not reservation.user_id or reservation.user_id != current_user.id:
                return jsonify({
                    "error": "Vous n'avez pas les droits pour modifier cette réservation",
                    "solution": "Contactez un administrateur"
                }), 403

        data = request.get_json()
        updated_reservation, error = update_room_reservation(
            reservation_id,
            data,
            current_user.id
        )

        if error:
            return jsonify({"error": error}), 400

        return jsonify({
            "message": "Réservation mise à jour avec succès",
            "reservation": {
                "id": updated_reservation.id,
                "statut": updated_reservation.statut if isinstance(updated_reservation.statut, str) else updated_reservation.statut.value,
                "dates": f"{updated_reservation.date_arrivee} au {updated_reservation.date_depart}",
                "user_id": updated_reservation.user_id
            }
        })

    except Exception as e:
        db.session.rollback()
        print(f"[ERREUR] {str(e)}")
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500

    
    
    

@reservation_bp.route('/rooms/<int:reservation_id>', methods=['DELETE'])
@jwt_required()
def remove_room_reservation(reservation_id):
    try:
        # Récupération de la réservation
        reservation = RoomReservation.query.get_or_404(reservation_id)
        
        # Vérification des droits
        auth_check = admin_or_owner_required(reservation)
        if auth_check:
            return auth_check
        
        # Suppression effective
        db.session.delete(reservation)
        db.session.commit()
        
        return jsonify({
            "message": "Réservation supprimée avec succès",
            "deleted_id": reservation_id
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la suppression: {str(e)}"}), 500
    
    
    

@reservation_bp.route('/rooms/<int:reservation_id>', methods=['GET'])
@jwt_required()
def room_reservation_details(reservation_id):
    reservation = RoomReservation.query.get_or_404(reservation_id)
    auth_error = admin_or_owner_required(reservation)
    if auth_error:
        return auth_error
    
    return jsonify({
        "id": reservation.id,
        "nom": reservation.nom,
        "prenom": reservation.prenom,
        "email": reservation.email,
        "room_id": reservation.room_id,
        "date_arrivee": reservation.date_arrivee.isoformat(),
        "date_depart": reservation.date_depart.isoformat(),
        "nombre_personnes": reservation.nombre_personnes,
        "methode_paiement": reservation.methode_paiement,
        "statut": reservation.statut,
        "prix_total": reservation.prix_total,
        "notes": reservation.notes,
        "created_at": reservation.created_at.isoformat()
    })

@reservation_bp.route('/rooms', methods=['GET'])
@jwt_required()
def list_room_reservations():
    params = {
        'hotel_id': request.args.get('hotel_id'),
        'room_id': request.args.get('room_id'),
        'status': request.args.get('status'),
        'email': request.args.get('email'),
        'from_date': request.args.get('from_date'),
        'to_date': request.args.get('to_date')
    }
    
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    reservations, error = search_room_reservations(
        params,
        current_user.id if current_user.role not in ['admin', 'superadmin'] else None
    )
    
    if error:
        return jsonify({"error": error}), 500
    
    return jsonify([{
        "id": r.id,
        "nom": r.nom,
        "prenom": r.prenom,
        "room_id": r.room_id,
        "dates": f"{r.date_arrivee} au {r.date_depart}",
        "statut": r.statut,
        "prix_total": r.prix_total
    } for r in reservations])

# Routes pour les réservations d'appartements
@reservation_bp.route('/apartments', methods=['POST'])
@jwt_required()
def add_apartment_reservation():
    data = request.get_json()
    
    required_fields = ['apartment_id', 'nom', 'prenom', 'email', 'date_arrivee', 'date_depart', 'nombre_personnes']
    if not all(field in data for field in required_fields):
        return jsonify({"error": f"Champs obligatoires manquants: {', '.join(required_fields)}"}), 400
    
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    
    reservation, error = create_apartment_reservation(
        data['apartment_id'],
        data,
        current_user.id if current_user else None
    )
    
    if error:
        return jsonify({"error": error}), 400
    
    # Envoi de la notification à l'admin
    send_reservation_notification(reservation, 'appartement')
    
    return jsonify({
        "message": "Réservation d'appartement créée avec succès",
        "reservation": {
            "id": reservation.id,
            "nom": reservation.nom,
            "prenom": reservation.prenom,
            "dates": f"{reservation.date_arrivee} au {reservation.date_depart}",
            "prix_total": reservation.prix_total,
            "statut": reservation.statut
        }
    }), 201
    
    
    
    
    
    

@reservation_bp.route('/apartments/<int:reservation_id>', methods=['PUT'])
@jwt_required()
def modify_apartment_reservation(reservation_id):
    try:
        reservation = ApartmentReservation.query.get_or_404(reservation_id)
        current_user_email = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user_email).first()

        print(f"[DEBUG] Current user: ID={current_user.id}, Role='{current_user.role}'")

        if current_user.role not in ['admin', 'superadmin']:
            print(f"[DEBUG] Access denied: user role '{current_user.role}' not allowed")
            if not reservation.user_id or reservation.user_id != current_user.id:
                return jsonify({
                    "error": "Vous n'avez pas les droits pour modifier cette réservation"
                }), 403

        data = request.get_json()

        if 'nombre_personnes' in data and data['nombre_personnes'] <= 0:
            return jsonify({"error": "Le nombre de personnes doit être positif"}), 400

        updated_reservation, error = update_apartment_reservation(
            reservation_id,
            data,
            current_user.id
        )

        if error:
            return jsonify({"error": error}), 400

        return jsonify({
            "message": "Réservation d'appartement mise à jour avec succès",
            "reservation": {
                "id": updated_reservation.id,
                "apartment_id": updated_reservation.apartment_id,
                "statut": updated_reservation.statut.value if hasattr(updated_reservation.statut, 'value') else updated_reservation.statut,
                "dates": f"{updated_reservation.date_arrivee} au {updated_reservation.date_depart}",
                "user_id": updated_reservation.user_id
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500




@reservation_bp.route('/apartments/<int:reservation_id>', methods=['DELETE'])
@jwt_required()
def delete_apartment_reservation(reservation_id):
    try:
        reservation = ApartmentReservation.query.get_or_404(reservation_id)
        
        # Vérification des droits
        auth_check = admin_or_owner_required(reservation)
        if auth_check:
            return auth_check
        
        # Journalisation avant suppression (optionnel)
        logger.info(f"Suppression appartement {reservation_id} par {get_jwt_identity()}")
        
        # Suppression effective
        db.session.delete(reservation)
        db.session.commit()
        
        return jsonify({
            "message": "Réservation d'appartement supprimée avec succès",
            "deleted_reservation": {
                "id": reservation.id,
                "apartment_id": reservation.apartment_id,
                "dates": f"{reservation.date_arrivee} au {reservation.date_depart}"
            }
        })
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erreur suppression appartement {reservation_id}: {str(e)}")
        return jsonify({"error": f"Erreur lors de la suppression: {str(e)}"}), 500
    
    
    

@reservation_bp.route('/apartments/<int:reservation_id>', methods=['GET'])
@jwt_required()
def apartment_reservation_details(reservation_id):
    reservation = ApartmentReservation.query.get_or_404(reservation_id)
    auth_error = admin_or_owner_required(reservation)
    if auth_error:
        return auth_error
    
    return jsonify({
        "id": reservation.id,
        "nom": reservation.nom,
        "prenom": reservation.prenom,
        "email": reservation.email,
        "apartment_id": reservation.apartment_id,
        "date_arrivee": reservation.date_arrivee.isoformat(),
        "date_depart": reservation.date_depart.isoformat(),
        "nombre_personnes": reservation.nombre_personnes,
        "methode_paiement": reservation.methode_paiement,
        "statut": reservation.statut,
        "prix_total": reservation.prix_total,
        "notes": reservation.notes,
        "created_at": reservation.created_at.isoformat()
    })
    
    
    
@reservation_bp.route('/apartments', methods=['GET'])
@jwt_required()
def list_apartment_reservations():
    params = {
        'hotel_id': request.args.get('hotel_id'),
        'apartment_id': request.args.get('apartment_id'),
        'status': request.args.get('status'),
        'email': request.args.get('email'),
        'from_date': request.args.get('from_date'),
        'to_date': request.args.get('to_date')
    }
    
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    reservations, error = search_apartment_reservations(
        params,
        current_user.id if current_user.role not in ['admin', 'superadmin'] else None
    )
    
    if error:
        return jsonify({"error": error}), 500
    
    return jsonify([{
        "id": r.id,
        "nom": r.nom,
        "prenom": r.prenom,
        "apartment_id": r.apartment_id,
        "dates": f"{r.date_arrivee} au {r.date_depart}",
        "statut": r.statut,
        "prix_total": r.prix_total
    } for r in reservations])
    

# Routes pour les réservations de salles d'événements
@reservation_bp.route('/event-rooms', methods=['POST'])
@jwt_required()
def add_event_room_reservation():
    data = request.get_json()
    
    required_fields = [
        'event_room_id', 'nom', 'prenom', 'email', 
        'type_evenement', 'date_evenement', 
        'heure_debut', 'heure_fin', 'nombre_invites'
    ]
    if not all(field in data for field in required_fields):
        return jsonify({"error": f"Champs obligatoires manquants: {', '.join(required_fields)}"}), 400
    
    if data['type_evenement'] not in VALID_EVENT_TYPES:
        return jsonify({
            "error": f"Type d'événement invalide. Valeurs valides: {', '.join(VALID_EVENT_TYPES)}"
        }), 400
    
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    
    reservation, error = create_event_room_reservation(
        data['event_room_id'],
        data,
        current_user.id if current_user else None
    )
    
    if error:
        return jsonify({"error": error}), 400
    
    # Envoi de la notification à l'admin
    send_reservation_notification(reservation, 'salle-evenement')
    
    return jsonify({
        "message": "Réservation de salle d'événement créée avec succès",
        "reservation": {
            "id": reservation.id,
            "nom": reservation.nom,
            "prenom": reservation.prenom,
            "date": reservation.date_evenement.isoformat(),
            "heures": f"{reservation.heure_debut} à {reservation.heure_fin}",
            "prix_total": reservation.prix_total,
            "statut": reservation.statut
        }
    }), 201
    
    
    

@reservation_bp.route('/event-rooms/<int:reservation_id>', methods=['PUT'])
@jwt_required()
def modify_event_room_reservation(reservation_id):
    try:
        reservation = EventRoomReservation.query.get_or_404(reservation_id)
        current_user = User.query.filter_by(email=get_jwt_identity()).first()

        print(f"[DEBUG] User:{current_user.id}, Role:{current_user.role}")
        print(f"[DEBUG] Reservation Status:{reservation.statut}")

        # Vérification des droits
        if current_user.role not in ['admin', 'superadmin']:
            if not reservation.user_id or reservation.user_id != current_user.id:
                return jsonify({
                    "error": "Accès refusé",
                    "solution": "Contactez un administrateur"
                }), 403

        data = request.get_json()

        # Validation du type d'événement
        if 'type_evenement' in data and data['type_evenement'] not in VALID_EVENT_TYPES:
            return jsonify({
                "error": f"Type invalide. Valides: {', '.join(VALID_EVENT_TYPES)}"
            }), 400

        # Validation du statut
        if 'statut' in data:
            valid_statuses = ['en attente', 'confirmée', 'annulée']
 
            if data['statut'] not in valid_statuses:
                return jsonify({
                    "error": "Statut invalide",
                    "valides": valid_statuses
                }), 400

        # Mise à jour
        updated_reservation, error = update_event_room_reservation(
            reservation_id,
            data,
            current_user.id
        )

        if error:
            return jsonify({"error": error}), 400

        return jsonify({
            "message": "Mise à jour réussie",
            "reservation": {
                "id": updated_reservation.id,
                "statut": updated_reservation.statut,  # Directement la chaîne de caractères
                "type_evenement": updated_reservation.type_evenement,
                "date": updated_reservation.date_evenement.isoformat(),
                "user_id": updated_reservation.user_id
            }
        })

    except Exception as e:
        db.session.rollback()
        print(f"[ERREUR] {str(e)}")
        return jsonify({
            "error": "Erreur technique",
            "details": str(e)[:200]  # Limite la taille pour la sécurité
        }), 500
        
        


@reservation_bp.route('/event-rooms/<int:reservation_id>', methods=['DELETE'])
@jwt_required()
def delete_event_room_reservation(reservation_id):
    try:
        reservation = EventRoomReservation.query.get_or_404(reservation_id)
        
        # Vérification des droits
        auth_check = admin_or_owner_required(reservation)
        if auth_check:
            return auth_check
        
        # Suppression effective
        db.session.delete(reservation)
        db.session.commit()
        
        # Envoi de confirmation (optionnel)
        send_deletion_confirmation(reservation.email, 'salle-evenement')
        
        return jsonify({
            "message": "Réservation de salle supprimée avec succès",
            "deleted_id": reservation_id,
            "event_type": reservation.type_evenement
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur lors de la suppression: {str(e)}"}), 500



@reservation_bp.route('/event-rooms/<int:reservation_id>', methods=['GET'])
@jwt_required()
def event_room_reservation_details(reservation_id):
    reservation = EventRoomReservation.query.get_or_404(reservation_id)
    auth_error = admin_or_owner_required(reservation)
    if auth_error:
        return auth_error
    
    return jsonify({
        "id": reservation.id,
        "nom": reservation.nom,
        "prenom": reservation.prenom,
        "email": reservation.email,
        "event_room_id": reservation.event_room_id,
        "type_evenement": reservation.type_evenement,
        "date_evenement": reservation.date_evenement.isoformat(),
        "heure_debut": reservation.heure_debut.isoformat(),
        "heure_fin": reservation.heure_fin.isoformat(),
        "nombre_invites": reservation.nombre_invites,
        "methode_paiement": reservation.methode_paiement,
        "statut": reservation.statut,
        "prix_total": reservation.prix_total,
        "notes": reservation.notes,
        "created_at": reservation.created_at.isoformat()
    })
@reservation_bp.route('/event-rooms', methods=['GET'])
@jwt_required()
def list_event_room_reservations():
    params = {
        'hotel_id': request.args.get('hotel_id'),
        'event_room_id': request.args.get('event_room_id'),
        'status': request.args.get('status'),
        'email': request.args.get('email'),
        'from_date': request.args.get('from_date'),
        'to_date': request.args.get('to_date')
    }
    
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    reservations, error = search_event_room_reservations(
        params,
        current_user.id if current_user.role not in ['admin', 'superadmin'] else None
    )
    
    if error:
        return jsonify({"error": error}), 500
    
    return jsonify([{
        "id": r.id,
        "nom": r.nom,
        "prenom": r.prenom,
        "event_room_id": r.event_room_id,
        "date_evenement": r.date_evenement.isoformat(),
        "statut": r.statut,
        "prix_total": r.prix_total
    } for r in reservations])    
    
    
    
    
    # les statistiques 
    
    
@reservation_bp.route('/quick-stats', methods=['GET'])
@jwt_required()
def get_quick_stats():
    """Endpoint pour les statistiques rapides du dashboard"""
    try:
        current_user = User.query.filter_by(email=get_jwt_identity()).first()
        
        # Vérification des droits (uniquement admin)
        if current_user.role not in ['admin', 'superadmin']:
            return jsonify({"error": "Accès non autorisé"}), 403
        
        # Calcul des statistiques
        stats = {
            "apartments": calculate_apartment_stats(),
            "rooms": calculate_room_stats(),
            "event_rooms": calculate_event_room_stats(),
            "revenue": calculate_today_revenue(),
            "departures": calculate_today_departures(),
            "occupancy_rate": calculate_monthly_occupancy()
        }
        
        return jsonify(stats)
    
    except Exception as e:
        logger.error(f"Erreur dans quick-stats: {str(e)}")
        return jsonify({"error": "Erreur serveur"}), 500


def calculate_apartment_stats():
    """Calcule les stats des appartements"""
    total = ApartmentReservation.query.count()
    occupied = ApartmentReservation.query.filter(
        ApartmentReservation.statut == 'confirmée'
    ).count()
    
    return {
        "occupied": occupied,
        "total": 16,
        "percentage": round((occupied / 16) * 100) if 16 > 0 else 0
    }


def calculate_room_stats():
    """Calcule les stats des chambres"""
    occupied = RoomReservation.query.filter(
        RoomReservation.statut == 'confirmée'
    ).count()
    
    return {
        "occupied": occupied,
        "total": 50,
        "percentage": round((occupied / 50) * 100) if 50 > 0 else 0
    }


def calculate_event_room_stats():
    """Calcule les stats des salles d'événement"""
    reserved = EventRoomReservation.query.filter(
        EventRoomReservation.statut == 'confirmée'
    ).count()
    
    return {
        "reserved": reserved,
        "total": 5,
        "percentage": round((reserved / 5) * 100) if 5 > 0 else 0
    }


def calculate_today_revenue():
    """Calcule le revenu du jour"""
    today = datetime.date.today()
    
    # Revenu des appartements
    apartment_revenue = db.session.query(
        func.sum(ApartmentReservation.prix_total)
    ).filter(
        ApartmentReservation.date_arrivee == today,
        ApartmentReservation.statut == 'confirmée'
    ).scalar() or 0
    
    # Revenu des chambres
    room_revenue = db.session.query(
        func.sum(RoomReservation.prix_total)
    ).filter(
        RoomReservation.date_arrivee == today,
        RoomReservation.statut == 'confirmée'
    ).scalar() or 0
    
    # Revenu des salles
    event_revenue = db.session.query(
        func.sum(EventRoomReservation.prix_total)
    ).filter(
        EventRoomReservation.date_evenement == today,
        EventRoomReservation.statut == 'confirmée'
    ).scalar() or 0
    
    total = apartment_revenue + room_revenue + event_revenue

    # Pour simplifier, évolution est mise en fixe
    yesterday = today - datetime.timedelta(days=1)
    
    return {
        "amount": total,
        "evolution": 12  # Peut être calculée dynamiquement si besoin
    }


def calculate_today_departures():
    """Compte les départs du jour"""
    today = datetime.date.today()
    
    departures = RoomReservation.query.filter(
        RoomReservation.date_depart == today,
        RoomReservation.statut == 'confirmée'
    ).count()
    
    arrivals = RoomReservation.query.filter(
        RoomReservation.date_arrivee == today,
        RoomReservation.statut == 'confirmée'
    ).count()
    
    return {
        "departures": departures,
        "arrivals": arrivals
    }
    
def calculate_monthly_occupancy():
    """Calcule le taux de remplissage mensuel moyen"""
    # Simplifié pour l’exemple
    return {
        "rate": 78,
        "description": "Moyenne mensuelle"
    }
    
    
    
    

# statistique 2 pour les revenu    
    
@reservation_bp.route('/revenue-distribution', methods=['GET'])
@jwt_required()
def get_revenue_distribution():
    try:
        # 1. Calculer les revenus des appartements (somme des prix confirmés)
        apartments_revenue = db.session.query(
            func.sum(ApartmentReservation.prix_total)
        ).filter(
            ApartmentReservation.statut == 'confirmée'
        ).scalar() or 0

        # 2. Calculer les revenus des chambres
        rooms_revenue = db.session.query(
            func.sum(RoomReservation.prix_total)
        ).filter(
            RoomReservation.statut == 'confirmée'
        ).scalar() or 0

        # 3. Calculer les revenus des salles d'événements
        event_rooms_revenue = db.session.query(
            func.sum(EventRoomReservation.prix_total)
        ).filter(
            EventRoomReservation.statut == 'confirmée'
        ).scalar() or 0

        # 4. Supposons que les services rapportent 10% du total (à adapter)
        total_revenue = apartments_revenue + rooms_revenue + event_rooms_revenue
        services_revenue = total_revenue * 0.1  # Exemple

        # 5. Formater les données pour le frontend
        return jsonify({
            "labels": ["Appartements", "Chambres", "Salles de fête", "Services"],
            "datasets": [{
                "data": [
                    float(apartments_revenue),
                    float(rooms_revenue),
                    float(event_rooms_revenue),
                    float(services_revenue)
                ],
                "backgroundColor": [
                    "rgba(59, 130, 246, 0.7)",
                    "rgba(16, 185, 129, 0.7)",
                    "rgba(245, 158, 11, 0.7)",
                    "rgba(239, 68, 68, 0.7)"
                ],
                "borderColor": [
                    "rgba(59, 130, 246, 1)",
                    "rgba(16, 185, 129, 1)",
                    "rgba(245, 158, 11, 1)",
                    "rgba(239, 68, 68, 1)"
                ],
                "borderWidth": 1
            }]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500  
    
    
# statistique 3 pour continuer 

@reservation_bp.route('/occupancy-stats', methods=['GET'])
@jwt_required()
def get_occupancy_stats():
    try:
        # Récupération dynamique du nombre total de logements disponibles
        total_apartments = Apartment.query.count()
        total_rooms = Room.query.count()
        total_event_rooms = EventRoom.query.count()

        # Date du jour (avec datetime. maintenant que tu as importé tout le module)
        today = datetime.datetime.now().date()

        # Réservations d'appartements actives aujourd'hui
        occupied_apartments = ApartmentReservation.query.filter(
            ApartmentReservation.date_arrivee <= today,
            ApartmentReservation.date_depart >= today,
            ApartmentReservation.statut == 'confirmée'
        ).count()

        # Réservations de chambres actives aujourd'hui
        occupied_rooms = RoomReservation.query.filter(
            RoomReservation.date_arrivee <= today,
            RoomReservation.date_depart >= today,
            RoomReservation.statut == 'confirmée'
        ).count()

        # Salles d'événement réservées aujourd'hui
        reserved_event_rooms = EventRoomReservation.query.filter(
            EventRoomReservation.date_evenement == today,
            EventRoomReservation.statut == 'confirmée'
        ).count()

        # Calcul des taux d'occupation
        stats = {
            "apartments": round((occupied_apartments / total_apartments) * 100) if total_apartments > 0 else 0,
            "rooms": round((occupied_rooms / total_rooms) * 100) if total_rooms > 0 else 0,
            "event_rooms": round((reserved_event_rooms / total_event_rooms) * 100) if total_event_rooms > 0 else 0,
        }

        return jsonify(stats)

    except Exception as e:
        logger.error(f"Erreur dans /occupancy-stats: {str(e)}")
        return jsonify({"error": "Erreur serveur"}), 500

class relativedelta:
    def __init__(self):
        pass
    
    
#statistique 4

@reservation_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        today = datetime.datetime.now().date()

        # Mois courant et précédent
        first_day_this_month = today.replace(day=1)
        last_day_last_month = first_day_this_month - datetime.timedelta(days=1)
        first_day_last_month = last_day_last_month.replace(day=1)

        # Semaine courante et précédente
        start_week_current = today - datetime.timedelta(days=today.weekday())
        start_week_prev = start_week_current - datetime.timedelta(days=7)
        end_week_prev = start_week_current - datetime.timedelta(days=1)

        # --- Revenu total ---
        def revenu_period(start_date, end_date):
            apt = db.session.query(func.sum(ApartmentReservation.prix_total)).filter(
                ApartmentReservation.statut == 'confirmée',
                ApartmentReservation.date_arrivee >= start_date,
                ApartmentReservation.date_arrivee <= end_date
            ).scalar() or 0
            room = db.session.query(func.sum(RoomReservation.prix_total)).filter(
                RoomReservation.statut == 'confirmée',
                RoomReservation.date_arrivee >= start_date,
                RoomReservation.date_arrivee <= end_date
            ).scalar() or 0
            event = db.session.query(func.sum(EventRoomReservation.prix_total)).filter(
                EventRoomReservation.statut == 'confirmée',
                EventRoomReservation.date_evenement >= start_date,
                EventRoomReservation.date_evenement <= end_date
            ).scalar() or 0
            return apt + room + event

        revenu_ce_mois = revenu_period(first_day_this_month, today)
        revenu_mois_precedent = revenu_period(first_day_last_month, last_day_last_month)

        revenu_change_pct = 0
        if revenu_mois_precedent > 0:
            revenu_change_pct = round(((revenu_ce_mois - revenu_mois_precedent) / revenu_mois_precedent) * 100, 2)

        # --- Taux d'occupation ---
        def occupation_rate(start_date, end_date):
            total_days = (end_date - start_date).days + 1
            total_apartments = Apartment.query.count()
            total_rooms = Room.query.count()
            total_event_rooms = EventRoom.query.count()
            total_logements = total_apartments + total_rooms + total_event_rooms
            if total_logements == 0 or total_days == 0:
                return 0

            apt_days = 0
            apt_reservs = ApartmentReservation.query.filter(
                ApartmentReservation.statut == 'confirmée',
                ApartmentReservation.date_depart >= start_date,
                ApartmentReservation.date_arrivee <= end_date
            ).all()
            for r in apt_reservs:
                deb = max(r.date_arrivee, start_date)
                fin = min(r.date_depart, end_date)
                apt_days += (fin - deb).days + 1

            room_days = 0
            room_reservs = RoomReservation.query.filter(
                RoomReservation.statut == 'confirmée',
                RoomReservation.date_depart >= start_date,
                RoomReservation.date_arrivee <= end_date
            ).all()
            for r in room_reservs:
                deb = max(r.date_arrivee, start_date)
                fin = min(r.date_depart, end_date)
                room_days += (fin - deb).days + 1

            event_days = EventRoomReservation.query.filter(
                EventRoomReservation.statut == 'confirmée',
                EventRoomReservation.date_evenement >= start_date,
                EventRoomReservation.date_evenement <= end_date
            ).count()

            total_occupied_days = apt_days + room_days + event_days
            rate = (total_occupied_days / (total_logements * total_days)) * 100
            return round(rate, 2)

        occupancy_this_month = occupation_rate(first_day_this_month, today)
        occupancy_last_month = occupation_rate(first_day_last_month, last_day_last_month)

        occupancy_change_pct = 0
        if occupancy_last_month > 0:
            occupancy_change_pct = round(((occupancy_this_month - occupancy_last_month) / occupancy_last_month) * 100, 2)

        # --- Nouvelles réservations ---
        new_reserv_current_week = (
            ApartmentReservation.query.filter(
                ApartmentReservation.date_arrivee >= start_week_current
            ).count() +
            RoomReservation.query.filter(
                RoomReservation.date_arrivee >= start_week_current
            ).count() +
            EventRoomReservation.query.filter(
                EventRoomReservation.date_evenement >= start_week_current
            ).count()
        )

        new_reserv_prev_week = (
            ApartmentReservation.query.filter(
                and_(ApartmentReservation.date_arrivee >= start_week_prev,
                     ApartmentReservation.date_arrivee <= end_week_prev)
            ).count() +
            RoomReservation.query.filter(
                and_(RoomReservation.date_arrivee >= start_week_prev,
                     RoomReservation.date_arrivee <= end_week_prev)
            ).count() +
            EventRoomReservation.query.filter(
                and_(EventRoomReservation.date_evenement >= start_week_prev,
                     EventRoomReservation.date_evenement <= end_week_prev)
            ).count()
        )

        new_reserv_change = new_reserv_current_week - new_reserv_prev_week
        new_reserv_change_str = f"{'+' if new_reserv_change >= 0 else ''}{new_reserv_change} cette semaine"

        # --- Clients satisfaits (placeholder) ---
        satisfied_clients_percent = 92
        satisfied_clients_change = 2

        stats = [
            {
                "title": "Revenu total",
                "value": f"{revenu_ce_mois:.2f}€",
                "change": f"{'+' if revenu_change_pct >= 0 else ''}{revenu_change_pct}% ce mois",
                "icon": "fa-euro-sign",
                "color": "bg-blue-100 text-blue-600",
            },
            {
                "title": "Occupancy Rate",
                "value": f"{occupancy_this_month}%",
                "change": f"{'+' if occupancy_change_pct >= 0 else ''}{occupancy_change_pct}% ce mois",
                "icon": "fa-bed",
                "color": "bg-green-100 text-green-600",
            },
            {
                "title": "Nouvelles réservations",
                "value": str(new_reserv_current_week),
                "change": new_reserv_change_str,
                "icon": "fa-calendar-check",
                "color": "bg-purple-100 text-purple-600",
            },
            {
                "title": "Clients satisfaits",
                "value": f"{satisfied_clients_percent}%",
                "change": f"+{satisfied_clients_change}% ce mois",
                "icon": "fa-smile",
                "color": "bg-yellow-100 text-yellow-600",
            },
        ]

        return jsonify(stats), 200

    except Exception as e:
        import logging
        logging.error(f"Erreur dans /dashboard-stats: {str(e)}")
        return jsonify({"error": "Erreur serveur"}), 500
    
    
    
# les statistiques 5
