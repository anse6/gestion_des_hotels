import datetime
from venv import logger
from flask import Blueprint, logging, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, desc, extract, func
from app.extensions import db
from app.modules.auth.models import User
from app.modules.hotel.models import Apartment, EventRoom, Hotel, Room
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

    # Si admin, on récupère les hôtels qu'il gère
    admin_hotel_ids = None
    if current_user.role == 'admin':
        hotels = Hotel.query.filter_by(admin_id=current_user.id).all()
        admin_hotel_ids = [hotel.id for hotel in hotels]

    reservations, error = search_room_reservations(
        filters=params,
        user_id=None if current_user.role in ['admin', 'superadmin'] else current_user.id,
        admin_hotel_ids=admin_hotel_ids
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

    # Récupération des hôtels de l'admin
    admin_hotel_ids = None
    if current_user.role == 'admin':
        hotels = Hotel.query.filter_by(admin_id=current_user.id).all()
        admin_hotel_ids = [hotel.id for hotel in hotels]

    reservations, error = search_apartment_reservations(
        filters=params,
        user_id=None if current_user.role in ['admin', 'superadmin'] else current_user.id,
        admin_hotel_ids=admin_hotel_ids
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

    # Récupérer les hôtels de l'admin
    admin_hotel_ids = None
    if current_user.role == 'admin':
        hotels = Hotel.query.filter_by(admin_id=current_user.id).all()
        admin_hotel_ids = [hotel.id for hotel in hotels]

    reservations, error = search_event_room_reservations(
        filters=params,
        user_id=None if current_user.role in ['admin', 'superadmin'] else current_user.id,
        admin_hotel_ids=admin_hotel_ids
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
    try:
        current_user = User.query.filter_by(email=get_jwt_identity()).first()

        if current_user.role not in ['admin', 'superadmin']:
            return jsonify({"error": "Accès refusé. Droits administrateur requis."}), 403

        today = datetime.date.today()
        yesterday = today - datetime.timedelta(days=1)

        # Obtenir les hôtels liés à l'utilisateur
        if current_user.role == 'admin':
            hotels = Hotel.query.filter_by(admin_id=current_user.id).all()
        else:  # superadmin
            hotels = Hotel.query.all()

        admin_hotel_ids = [hotel.id for hotel in hotels]

        # === TOTALS ===
        total_rooms = Room.query.filter(Room.hotel_id.in_(admin_hotel_ids)).count()
        total_apartments = Apartment.query.filter(Apartment.hotel_id.in_(admin_hotel_ids)).count()
        total_event_rooms = EventRoom.query.filter(EventRoom.hotel_id.in_(admin_hotel_ids)).count()

        # === OCCUPATIONS ===
        occupied_rooms = db.session.query(RoomReservation).join(Room).filter(
            Room.hotel_id.in_(admin_hotel_ids),
            RoomReservation.date_arrivee <= today,
            RoomReservation.date_depart >= today,
            RoomReservation.statut == ReservationStatus.CONFIRMED
        ).count()

        occupied_apartments = db.session.query(ApartmentReservation).join(Apartment).filter(
            Apartment.hotel_id.in_(admin_hotel_ids),
            ApartmentReservation.date_arrivee <= today,
            ApartmentReservation.date_depart >= today,
            ApartmentReservation.statut == ReservationStatus.CONFIRMED
        ).count()

        reserved_event_rooms = db.session.query(EventRoomReservation).join(EventRoom).filter(
            EventRoom.hotel_id.in_(admin_hotel_ids),
            EventRoomReservation.date_evenement == today,
            EventRoomReservation.statut == ReservationStatus.CONFIRMED
        ).count()

        apartment_percentage = round((occupied_apartments / total_apartments * 100) if total_apartments > 0 else 0, 1)
        room_percentage = round((occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0, 1)
        event_room_percentage = round((reserved_event_rooms / total_event_rooms * 100) if total_event_rooms > 0 else 0, 1)

        # === REVENUS AUJOURD'HUI ===
        room_revenue_today = db.session.query(func.sum(RoomReservation.prix_total)).join(Room).filter(
            Room.hotel_id.in_(admin_hotel_ids),
            RoomReservation.date_arrivee <= today,
            RoomReservation.date_depart >= today,
            RoomReservation.statut == ReservationStatus.CONFIRMED
        ).scalar() or 0

        apartment_revenue_today = db.session.query(func.sum(ApartmentReservation.prix_total)).join(Apartment).filter(
            Apartment.hotel_id.in_(admin_hotel_ids),
            ApartmentReservation.date_arrivee <= today,
            ApartmentReservation.date_depart >= today,
            ApartmentReservation.statut == ReservationStatus.CONFIRMED
        ).scalar() or 0

        event_revenue_today = db.session.query(func.sum(EventRoomReservation.prix_total)).join(EventRoom).filter(
            EventRoom.hotel_id.in_(admin_hotel_ids),
            EventRoomReservation.date_evenement == today,
            EventRoomReservation.statut == ReservationStatus.CONFIRMED
        ).scalar() or 0

        total_revenue_today = room_revenue_today + apartment_revenue_today + event_revenue_today

        # === REVENUS D’HIER ===
        room_revenue_yesterday = db.session.query(func.sum(RoomReservation.prix_total)).join(Room).filter(
            Room.hotel_id.in_(admin_hotel_ids),
            RoomReservation.date_arrivee <= yesterday,
            RoomReservation.date_depart >= yesterday,
            RoomReservation.statut == ReservationStatus.CONFIRMED
        ).scalar() or 0

        apartment_revenue_yesterday = db.session.query(func.sum(ApartmentReservation.prix_total)).join(Apartment).filter(
            Apartment.hotel_id.in_(admin_hotel_ids),
            ApartmentReservation.date_arrivee <= yesterday,
            ApartmentReservation.date_depart >= yesterday,
            ApartmentReservation.statut == ReservationStatus.CONFIRMED
        ).scalar() or 0

        event_revenue_yesterday = db.session.query(func.sum(EventRoomReservation.prix_total)).join(EventRoom).filter(
            EventRoom.hotel_id.in_(admin_hotel_ids),
            EventRoomReservation.date_evenement == yesterday,
            EventRoomReservation.statut == ReservationStatus.CONFIRMED
        ).scalar() or 0

        total_revenue_yesterday = room_revenue_yesterday + apartment_revenue_yesterday + event_revenue_yesterday

        # === ÉVOLUTION ===
        revenue_evolution = 0
        if total_revenue_yesterday > 0:
            revenue_evolution = round(((total_revenue_today - total_revenue_yesterday) / total_revenue_yesterday) * 100, 1)
        elif total_revenue_today > 0:
            revenue_evolution = 100

        # === DÉPARTS ET ARRIVÉES ===
        room_departures = db.session.query(RoomReservation).join(Room).filter(
            Room.hotel_id.in_(admin_hotel_ids),
            RoomReservation.date_depart == today,
            RoomReservation.statut == ReservationStatus.CONFIRMED
        ).count()

        apartment_departures = db.session.query(ApartmentReservation).join(Apartment).filter(
            Apartment.hotel_id.in_(admin_hotel_ids),
            ApartmentReservation.date_depart == today,
            ApartmentReservation.statut == ReservationStatus.CONFIRMED
        ).count()

        total_departures = room_departures + apartment_departures

        room_arrivals = db.session.query(RoomReservation).join(Room).filter(
            Room.hotel_id.in_(admin_hotel_ids),
            RoomReservation.date_arrivee == today,
            RoomReservation.statut == ReservationStatus.CONFIRMED
        ).count()

        apartment_arrivals = db.session.query(ApartmentReservation).join(Apartment).filter(
            Apartment.hotel_id.in_(admin_hotel_ids),
            ApartmentReservation.date_arrivee == today,
            ApartmentReservation.statut == ReservationStatus.CONFIRMED
        ).count()

        total_arrivals = room_arrivals + apartment_arrivals

        # === TAUX DE REMPLISSAGE GLOBAL ===
        total_units = total_apartments + total_rooms
        total_occupied = occupied_apartments + occupied_rooms
        occupancy_rate = round((total_occupied / total_units * 100) if total_units > 0 else 0, 1)

        if occupancy_rate >= 90:
            occupancy_description = "Excellent"
        elif occupancy_rate >= 70:
            occupancy_description = "Bon"
        elif occupancy_rate >= 50:
            occupancy_description = "Moyen"
        else:
            occupancy_description = "Faible"

        # === RÉPONSE JSON ===
        return jsonify({
            "apartments": {
                "occupied": occupied_apartments,
                "total": total_apartments,
                "percentage": apartment_percentage
            },
            "rooms": {
                "occupied": occupied_rooms,
                "total": total_rooms,
                "percentage": room_percentage
            },
            "event_rooms": {
                "reserved": reserved_event_rooms,
                "total": total_event_rooms,
                "percentage": event_room_percentage
            },
            "revenue": {
                "amount": int(total_revenue_today),
                "evolution": revenue_evolution
            },
            "departures": {
                "departures": total_departures,
                "arrivals": total_arrivals
            },
            "occupancy_rate": {
                "rate": occupancy_rate,
                "description": occupancy_description
            }
        }), 200

    except Exception as e:
        print(f"[ERREUR] Quick Stats: {str(e)}")
        return jsonify({
            "error": "Erreur lors du calcul des statistiques",
            "details": str(e)
        }), 500


# statistique 2 pour les revenu    
    
@reservation_bp.route('/revenue-chart', methods=['GET'])
@jwt_required()
def get_revenue_chart_data():
    """
    Endpoint pour récupérer les données de revenus par jour et par type
    pour alimenter le graphique en secteurs (PieChart)

    Paramètres query optionnels:
    - month: mois (1-12, défaut: mois actuel)
    - year: année (défaut: année actuelle)
    """
    try:
        current_user = User.query.filter_by(email=get_jwt_identity()).first()

        # Vérification des droits
        if current_user.role not in ['admin', 'superadmin']:
            return jsonify({"error": "Accès refusé. Droits administrateur requis."}), 403

        # Récupération des paramètres
        month = request.args.get('month', type=int, default=datetime.date.today().month)
        year = request.args.get('year', type=int, default=datetime.date.today().year)
        hotel_id_param = request.args.get('hotel_id', type=int, default=None)

        # Validation des paramètres
        if month < 1 or month > 12:
            return jsonify({"error": "Mois invalide. Doit être entre 1 et 12."}), 400
        if year < 2020 or year > 2030:
            return jsonify({"error": "Année invalide."}), 400

        # Calcul des dates de début et fin du mois
        start_date = datetime.date(year, month, 1)
        if month == 12:
            end_date = datetime.date(year + 1, 1, 1) - datetime.timedelta(days=1)
        else:
            end_date = datetime.date(year, month + 1, 1) - datetime.timedelta(days=1)

        # Détermination des hôtels accessibles
        if current_user.role == 'admin':
            hotels = Hotel.query.filter_by(admin_id=current_user.id).all()
        else:  # superadmin
            if hotel_id_param:
                hotels = Hotel.query.filter_by(id=hotel_id_param).all()
            else:
                hotels = Hotel.query.all()

        hotel_ids = [hotel.id for hotel in hotels]
        if not hotel_ids:
            return jsonify({"error": "Aucun hôtel trouvé pour cet utilisateur."}), 404

        # Initialisation du résultat
        daily_revenue = {}
        current_date = start_date
        while current_date <= end_date:
            day_str = current_date.strftime('%d')
            daily_revenue[day_str] = {
                'day': day_str,
                'chambres': 0,
                'salles': 0,
                'appartements': 0
            }
            current_date += datetime.timedelta(days=1)

        # Fonction pour récupérer revenus avec jointure et filtre hotel
        def get_revenues(model, date_field, join_model, hotel_fk):
            return db.session.query(
                func.day(date_field).label('day'),
                func.sum(model.prix_total).label('total_revenue')
            ).join(join_model).filter(
                and_(
                    date_field >= start_date,
                    date_field <= end_date,
                    model.statut == ReservationStatus.CONFIRMED,
                    getattr(join_model, hotel_fk).in_(hotel_ids)
                )
            ).group_by(func.day(date_field)).all()

        # Revenus chambres
        room_revenues = get_revenues(RoomReservation, RoomReservation.date_arrivee, Room, 'hotel_id')
        for day, revenue in room_revenues:
            day_str = f"{day:02d}"
            if day_str in daily_revenue:
                daily_revenue[day_str]['chambres'] = int(revenue or 0)

        # Revenus appartements
        apartment_revenues = get_revenues(ApartmentReservation, ApartmentReservation.date_arrivee, Apartment, 'hotel_id')
        for day, revenue in apartment_revenues:
            day_str = f"{day:02d}"
            if day_str in daily_revenue:
                daily_revenue[day_str]['appartements'] = int(revenue or 0)

        # Revenus salles d'événements
        event_revenues = get_revenues(EventRoomReservation, EventRoomReservation.date_evenement, EventRoom, 'hotel_id')
        for day, revenue in event_revenues:
            day_str = f"{day:02d}"
            if day_str in daily_revenue:
                daily_revenue[day_str]['salles'] = int(revenue or 0)

        # Conversion en liste ordonnée
        monthly_data = [daily_revenue[f"{i:02d}"] for i in range(1, end_date.day + 1)]

        # Totaux pour le pie chart
        total_chambres = sum(day['chambres'] for day in monthly_data)
        total_salles = sum(day['salles'] for day in monthly_data)
        total_appartements = sum(day['appartements'] for day in monthly_data)
        total_revenue = total_chambres + total_salles + total_appartements

        pie_data = [
            {'name': 'Chambres', 'value': total_chambres, 'color': '#0088FE'},
            {'name': 'Salles de fête', 'value': total_salles, 'color': '#00C49F'},
            {'name': 'Appartements', 'value': total_appartements, 'color': '#FFBB28'}
        ]

        # Calcul des pourcentages
        if total_revenue > 0:
            for item in pie_data:
                item['percentage'] = round((item['value'] / total_revenue) * 100, 1)
        else:
            for item in pie_data:
                item['percentage'] = 0

        period_info = {
            'month': month,
            'year': year,
            'month_name': datetime.date(year, month, 1).strftime('%B'),
            'total_days': len(monthly_data),
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat()
        }

        response_data = {
            'monthly_data': monthly_data,
            'pie_data': pie_data,
            'totals': {
                'chambres': total_chambres,
                'salles': total_salles,
                'appartements': total_appartements,
                'total': total_revenue
            },
            'period': period_info
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"[ERREUR] Revenue Chart: {str(e)}")
        return jsonify({
            "error": "Erreur lors du calcul des revenus",
            "details": str(e)
        }), 500

        


@reservation_bp.route('/revenue-summary', methods=['GET'])
@jwt_required()
def get_revenue_summary():
    """
    Endpoint simplifié pour récupérer uniquement les données du pie chart
    sans les détails quotidiens
    """
    try:
        current_user = User.query.filter_by(email=get_jwt_identity()).first()
        
        if current_user.role not in ['admin', 'superadmin']:
            return jsonify({"error": "Accès refusé. Droits administrateur requis."}), 403
        
        # Paramètres
        month = request.args.get('month', type=int, default=datetime.date.today().month)
        year = request.args.get('year', type=int, default=datetime.date.today().year)
        
        # Dates
        start_date = datetime.date(year, month, 1)
        if month == 12:
            end_date = datetime.date(year + 1, 1, 1) - datetime.timedelta(days=1)
        else:
            end_date = datetime.date(year, month + 1, 1) - datetime.timedelta(days=1)
        
        # Calcul des totaux directement
        total_chambres = db.session.query(
            func.sum(RoomReservation.prix_total)
        ).filter(
            and_(
                RoomReservation.date_arrivee >= start_date,
                RoomReservation.date_arrivee <= end_date,
                RoomReservation.statut == ReservationStatus.CONFIRMED
            )
        ).scalar() or 0
        
        total_appartements = db.session.query(
            func.sum(ApartmentReservation.prix_total)
        ).filter(
            and_(
                ApartmentReservation.date_arrivee >= start_date,
                ApartmentReservation.date_arrivee <= end_date,
                ApartmentReservation.statut == ReservationStatus.CONFIRMED
            )
        ).scalar() or 0
        
        total_salles = db.session.query(
            func.sum(EventRoomReservation.prix_total)
        ).filter(
            and_(
                EventRoomReservation.date_evenement >= start_date,
                EventRoomReservation.date_evenement <= end_date,
                EventRoomReservation.statut == ReservationStatus.CONFIRMED
            )
        ).scalar() or 0
        
        pie_data = [
            {
                'name': 'Chambres',
                'value': int(total_chambres),
                'color': '#0088FE'
            },
            {
                'name': 'Salles de fête',
                'value': int(total_salles),
                'color': '#00C49F'
            },
            {
                'name': 'Appartements',
                'value': int(total_appartements),
                'color': '#FFBB28'
            }
        ]
        
        return jsonify({
            'pie_data': pie_data,
            'total_revenue': int(total_chambres + total_appartements + total_salles),
            'period': {
                'month': month,
                'year': year,
                'month_name': datetime.date(year, month, 1).strftime('%B')
            }
        }), 200
        
    except Exception as e:
        print(f"[ERREUR] Revenue Summary: {str(e)}")
        return jsonify({
            "error": "Erreur lors du calcul du résumé des revenus",
            "details": str(e)
        }), 500
    
# statistique 3 pour continuer 





@reservation_bp.route('/occupancy-stats', methods=['GET'])
@jwt_required()
def get_occupancy_stats():
    try:
        current_user = User.query.filter_by(email=get_jwt_identity()).first()

        if current_user.role not in ['admin', 'superadmin']:
            return jsonify({"error": "Accès refusé"}), 403

        # Récupération des hôtels liés à l'admin
        if current_user.role == 'admin':
            hotels = Hotel.query.filter_by(admin_id=current_user.id).all()
        else:
            hotels = Hotel.query.all()

        admin_hotel_ids = [hotel.id for hotel in hotels]

        today = datetime.datetime.now().date()

        # === Appartements ===
        total_apartments = Apartment.query.filter(
            Apartment.hotel_id.in_(admin_hotel_ids)
        ).count()

        occupied_apartments = ApartmentReservation.query.join(Apartment).filter(
            Apartment.hotel_id.in_(admin_hotel_ids),
            ApartmentReservation.date_arrivee <= today,
            ApartmentReservation.date_depart >= today,
            ApartmentReservation.statut == 'confirmée'
        ).count()

        # === Chambres ===
        total_rooms = Room.query.filter(
            Room.hotel_id.in_(admin_hotel_ids)
        ).count()

        occupied_rooms = RoomReservation.query.join(Room).filter(
            Room.hotel_id.in_(admin_hotel_ids),
            RoomReservation.date_arrivee <= today,
            RoomReservation.date_depart >= today,
            RoomReservation.statut == 'confirmée'
        ).count()

        # === Salles d’événement ===
        total_event_rooms = EventRoom.query.filter(
            EventRoom.hotel_id.in_(admin_hotel_ids)
        ).count()

        reserved_event_rooms = EventRoomReservation.query.join(EventRoom).filter(
            EventRoom.hotel_id.in_(admin_hotel_ids),
            EventRoomReservation.date_evenement == today,
            EventRoomReservation.statut == 'confirmée'
        ).count()

        # === Résultat ===
        stats = {
            "apartments": round((occupied_apartments / total_apartments) * 100) if total_apartments > 0 else 0,
            "rooms": round((occupied_rooms / total_rooms) * 100) if total_rooms > 0 else 0,
            "event_rooms": round((reserved_event_rooms / total_event_rooms) * 100) if total_event_rooms > 0 else 0,
        }

        return jsonify(stats)

    except Exception as e:
        logger.error(f"Erreur dans /occupancy-stats: {str(e)}")
        return jsonify({"error": "Erreur serveur"}), 500

    
    
#statistique 4





@reservation_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        current_user = User.query.filter_by(email=get_jwt_identity()).first()
        if current_user.role not in ['admin', 'superadmin']:
            return jsonify({"error": "Accès refusé"}), 403

        # Récupération des hôtels liés à l'utilisateur
        if current_user.role == 'admin':
            hotels = Hotel.query.filter_by(admin_id=current_user.id).all()
        else:
            hotels = Hotel.query.all()

        admin_hotel_ids = [hotel.id for hotel in hotels]

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
            apt = db.session.query(func.sum(ApartmentReservation.prix_total)).join(Apartment).filter(
                Apartment.hotel_id.in_(admin_hotel_ids),
                ApartmentReservation.statut == 'confirmée',
                ApartmentReservation.date_arrivee >= start_date,
                ApartmentReservation.date_arrivee <= end_date
            ).scalar() or 0

            room = db.session.query(func.sum(RoomReservation.prix_total)).join(Room).filter(
                Room.hotel_id.in_(admin_hotel_ids),
                RoomReservation.statut == 'confirmée',
                RoomReservation.date_arrivee >= start_date,
                RoomReservation.date_arrivee <= end_date
            ).scalar() or 0

            event = db.session.query(func.sum(EventRoomReservation.prix_total)).join(EventRoom).filter(
                EventRoom.hotel_id.in_(admin_hotel_ids),
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
            total_apartments = Apartment.query.filter(Apartment.hotel_id.in_(admin_hotel_ids)).count()
            total_rooms = Room.query.filter(Room.hotel_id.in_(admin_hotel_ids)).count()
            total_event_rooms = EventRoom.query.filter(EventRoom.hotel_id.in_(admin_hotel_ids)).count()
            total_logements = total_apartments + total_rooms + total_event_rooms
            if total_logements == 0 or total_days == 0:
                return 0

            apt_days = 0
            apt_reservs = ApartmentReservation.query.join(Apartment).filter(
                Apartment.hotel_id.in_(admin_hotel_ids),
                ApartmentReservation.statut == 'confirmée',
                ApartmentReservation.date_depart >= start_date,
                ApartmentReservation.date_arrivee <= end_date
            ).all()
            for r in apt_reservs:
                deb = max(r.date_arrivee, start_date)
                fin = min(r.date_depart, end_date)
                apt_days += (fin - deb).days + 1

            room_days = 0
            room_reservs = RoomReservation.query.join(Room).filter(
                Room.hotel_id.in_(admin_hotel_ids),
                RoomReservation.statut == 'confirmée',
                RoomReservation.date_depart >= start_date,
                RoomReservation.date_arrivee <= end_date
            ).all()
            for r in room_reservs:
                deb = max(r.date_arrivee, start_date)
                fin = min(r.date_depart, end_date)
                room_days += (fin - deb).days + 1

            event_days = EventRoomReservation.query.join(EventRoom).filter(
                EventRoom.hotel_id.in_(admin_hotel_ids),
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
            ApartmentReservation.query.join(Apartment).filter(
                Apartment.hotel_id.in_(admin_hotel_ids),
                ApartmentReservation.date_arrivee >= start_week_current
            ).count() +
            RoomReservation.query.join(Room).filter(
                Room.hotel_id.in_(admin_hotel_ids),
                RoomReservation.date_arrivee >= start_week_current
            ).count() +
            EventRoomReservation.query.join(EventRoom).filter(
                EventRoom.hotel_id.in_(admin_hotel_ids),
                EventRoomReservation.date_evenement >= start_week_current
            ).count()
        )

        new_reserv_prev_week = (
            ApartmentReservation.query.join(Apartment).filter(
                Apartment.hotel_id.in_(admin_hotel_ids),
                ApartmentReservation.date_arrivee >= start_week_prev,
                ApartmentReservation.date_arrivee <= end_week_prev
            ).count() +
            RoomReservation.query.join(Room).filter(
                Room.hotel_id.in_(admin_hotel_ids),
                RoomReservation.date_arrivee >= start_week_prev,
                RoomReservation.date_arrivee <= end_week_prev
            ).count() +
            EventRoomReservation.query.join(EventRoom).filter(
                EventRoom.hotel_id.in_(admin_hotel_ids),
                EventRoomReservation.date_evenement >= start_week_prev,
                EventRoomReservation.date_evenement <= end_week_prev
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
                "value": f"{revenu_ce_mois:.2f}F",
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




@reservation_bp.route('/daily-revenue', methods=['GET'])
@jwt_required()
def get_daily_revenue():
    """
    API pour récupérer les revenus journaliers des réservations
    Accessible uniquement aux admins et superadmins.
    """
    try:
        current_user = User.query.filter_by(email=get_jwt_identity()).first()
        if not current_user or current_user.role not in ['admin', 'superadmin']:
            return jsonify({"error": "Accès refusé. Droits administrateur requis."}), 403

        # Paramètres
        month = request.args.get('month', type=int, default=datetime.datetime.now().month)
        year = request.args.get('year', type=int, default=datetime.datetime.now().year)
        hotel_id_param = request.args.get('hotel_id', type=int)

        if not (1 <= month <= 12):
            return jsonify({"error": "Mois invalide. Doit être entre 1 et 12."}), 400
        if year < 2020 or year > 2030:
            return jsonify({"error": "Année invalide."}), 400

        # Détermination des hôtels accessibles
        if current_user.role == 'admin':
            hotels = Hotel.query.filter_by(admin_id=current_user.id).all()
        else:  # superadmin
            if hotel_id_param:
                hotels = Hotel.query.filter_by(id=hotel_id_param).all()
            else:
                hotels = Hotel.query.all()

        hotel_ids = [hotel.id for hotel in hotels]
        if not hotel_ids:
            return jsonify({"error": "Aucun hôtel trouvé pour cet utilisateur."}), 404

        # Fonction de récupération des revenus par modèle
        def build_daily_revenue_query(model, date_field, join_model, hotel_fk):
            query = db.session.query(
                extract('day', date_field).label('day'),
                func.sum(model.prix_total).label('total')
            ).join(join_model).filter(
                extract('month', date_field) == month,
                extract('year', date_field) == year,
                model.statut == ReservationStatus.CONFIRMED,
                getattr(join_model, hotel_fk).in_(hotel_ids)
            ).group_by(extract('day', date_field))
            return query.all()

        # Requêtes
        room_revenues = build_daily_revenue_query(RoomReservation, RoomReservation.date_arrivee, Room, 'hotel_id')
        apartment_revenues = build_daily_revenue_query(ApartmentReservation, ApartmentReservation.date_arrivee, Apartment, 'hotel_id')
        event_revenues = build_daily_revenue_query(EventRoomReservation, EventRoomReservation.date_evenement, EventRoom, 'hotel_id')

        # Dictionnaires des résultats
        room_dict = {int(r.day): float(r.total or 0) for r in room_revenues}
        apartment_dict = {int(r.day): float(r.total or 0) for r in apartment_revenues}
        event_dict = {int(r.day): float(r.total or 0) for r in event_revenues}

        # Nombre de jours dans le mois
        from calendar import monthrange
        days_in_month = monthrange(year, month)[1]

        # Construction de la réponse jour par jour
        daily_data = []
        for day in range(1, days_in_month + 1):
            chambres = room_dict.get(day, 0)
            appartements = apartment_dict.get(day, 0)
            salles = event_dict.get(day, 0)
            daily_data.append({
                "day": f"{day:02d}",
                "chambres": chambres,
                "appartements": appartements,
                "salles": salles,
                "total": chambres + appartements + salles
            })

        # Totaux
        monthly_totals = {
            "chambres": sum(room_dict.values()),
            "appartements": sum(apartment_dict.values()),
            "salles": sum(event_dict.values()),
        }
        monthly_totals["total"] = sum(monthly_totals.values())

        return jsonify({
            "status": "success",
            "period": {
                "month": month,
                "year": year,
                "month_name": datetime.datetime(year, month, 1).strftime('%B'),
                "days_in_month": days_in_month
            },
            "daily_data": daily_data,
            "monthly_totals": monthly_totals,
            "currency": "F"
        })

    except Exception as e:
        return jsonify({
            "error": "Erreur lors de la récupération des revenus",
            "details": str(e)
        }), 500
