from app.extensions import db
from flask import current_app
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError

from app.modules.hotel.models import Room, EventRoom, Apartment
from .models import RoomReservation, ApartmentReservation, EventRoomReservation, ReservationStatus
from .utils import (
    calculate_room_total_price, calculate_apartment_total_price, calculate_event_room_total_price,
    is_room_available, is_apartment_available, is_event_room_available, 
    VALID_PAYMENT_METHODS, VALID_RESERVATION_STATUSES, VALID_EVENT_TYPES
)

# Services pour les réservations de chambres
def create_room_reservation(room_id, reservation_data, user_id=None):
    """
    Crée une nouvelle réservation de chambre
    """
    try:
        # Récupérer la chambre
        room = Room.query.get(room_id)
        if not room:
            return None, "Chambre non trouvée"
        
        # Vérifier si la chambre est disponible
        date_arrivee = reservation_data['date_arrivee']
        date_depart = reservation_data['date_depart']
        
        if not is_room_available(room_id, date_arrivee, date_depart):
            return None, "La chambre n'est pas disponible pour les dates demandées"
        
        # Calculer le prix total
        prix_total, error = calculate_room_total_price(room, date_arrivee, date_depart)
        if error:
            return None, error
        
        # Créer la réservation
        reservation = RoomReservation(
            room_id=room_id,
            nom=reservation_data['nom'],
            prenom=reservation_data['prenom'],
            email=reservation_data['email'],
            date_arrivee=date_arrivee,
            date_depart=date_depart,
            nombre_personnes=reservation_data['nombre_personnes'],
            methode_paiement=reservation_data.get('methode_paiement'),
            statut=ReservationStatus.CONFIRMED,
            prix_total=prix_total,
            notes=reservation_data.get('notes'),
            user_id=user_id
        )
        
        db.session.add(reservation)
        db.session.commit()
        
        return reservation, None
    except SQLAlchemyError as e:
        current_app.logger.error(f"Erreur SQL lors de la création de la réservation: {str(e)}")
        db.session.rollback()
        return None, "Erreur de base de données"
    except Exception as e:
        current_app.logger.error(f"Erreur lors de la création de la réservation: {str(e)}")
        db.session.rollback()
        return None, str(e)

def update_room_reservation(reservation_id, reservation_data, user_id=None):
    """
    Met à jour une réservation de chambre existante
    """
    try:
        # Récupérer la réservation
        reservation = RoomReservation.query.get(reservation_id)
        if not reservation:
            return None, "Réservation non trouvée"
        
        # Si l'utilisateur est fourni, vérifier qu'il est le propriétaire de la réservation
        if user_id and reservation.user_id != user_id:
            return None, "Vous n'avez pas les droits pour modifier cette réservation"
        
        # Si les dates changent, vérifier la disponibilité
        date_arrivee = reservation_data.get('date_arrivee', reservation.date_arrivee)
        date_depart = reservation_data.get('date_depart', reservation.date_depart)
        
        if date_arrivee != reservation.date_arrivee or date_depart != reservation.date_depart:
            if not is_room_available(reservation.room_id, date_arrivee, date_depart, exclude_reservation_id=reservation_id):
                return None, "La chambre n'est pas disponible pour les nouvelles dates demandées"
            
            # Recalculer le prix total si les dates changent
            prix_total, error = calculate_room_total_price(reservation.room, date_arrivee, date_depart)
            if error:
                return None, error
            reservation.prix_total = prix_total
        
        # Mettre à jour les champs
        reservation.nom = reservation_data.get('nom', reservation.nom)
        reservation.prenom = reservation_data.get('prenom', reservation.prenom)
        reservation.email = reservation_data.get('email', reservation.email)
        reservation.date_arrivee = date_arrivee
        reservation.date_depart = date_depart
        reservation.nombre_personnes = reservation_data.get('nombre_personnes', reservation.nombre_personnes)
        
        if 'methode_paiement' in reservation_data:
            reservation.methode_paiement = reservation_data['methode_paiement']
        
        if 'statut' in reservation_data:
            if reservation_data['statut'] in VALID_RESERVATION_STATUSES:
                reservation.statut = reservation_data['statut']
            else:
                return None, f"Statut invalide. Valeurs possibles: {', '.join(VALID_RESERVATION_STATUSES)}"
        
        if 'notes' in reservation_data:
            reservation.notes = reservation_data['notes']
        
        db.session.commit()
        return reservation, None
    except SQLAlchemyError as e:
        current_app.logger.error(f"Erreur SQL lors de la mise à jour de la réservation: {str(e)}")
        db.session.rollback()
        return None, "Erreur de base de données"
    except Exception as e:
        current_app.logger.error(f"Erreur lors de la mise à jour de la réservation: {str(e)}")
        db.session.rollback()
        return None, str(e)

def cancel_room_reservation(reservation_id, user_id=None):
    """
    Annule une réservation de chambre
    """
    try:
        # Récupérer la réservation
        reservation = RoomReservation.query.get(reservation_id)
        if not reservation:
            return False, "Réservation non trouvée"
        
        # Si l'utilisateur est fourni, vérifier qu'il est le propriétaire de la réservation
        if user_id and reservation.user_id != user_id:
            return False, "Vous n'avez pas les droits pour annuler cette réservation"
        
        # Mettre à jour le statut
        reservation.statut = ReservationStatus.CANCELLED
        
        db.session.commit()
        return True, None
    except Exception as e:
        current_app.logger.error(f"Erreur lors de l'annulation de la réservation: {str(e)}")
        db.session.rollback()
        return False, str(e)

def get_room_reservation(reservation_id, user_id=None):
    """
    Récupère les détails d'une réservation de chambre
    """
    try:
        # Récupérer la réservation
        reservation = RoomReservation.query.get(reservation_id)
        if not reservation:
            return None, "Réservation non trouvée"
        
        # Si l'utilisateur est fourni, vérifier qu'il est le propriétaire de la réservation
        if user_id and reservation.user_id != user_id:
            return None, "Vous n'avez pas les droits pour consulter cette réservation"
        
        return reservation, None
    except Exception as e:
        current_app.logger.error(f"Erreur lors de la récupération de la réservation: {str(e)}")
        return None, str(e)

def search_room_reservations(filters, user_id=None, admin_hotel_ids=None):
    query = RoomReservation.query.join(Room)

    if user_id:
        query = query.filter(RoomReservation.user_id == user_id)

    if filters.get('room_id'):
        query = query.filter(RoomReservation.room_id == filters['room_id'])

    if filters.get('status'):
        query = query.filter(RoomReservation.statut == filters['status'])

    if filters.get('email'):
        query = query.filter(RoomReservation.email.ilike(f"%{filters['email']}%"))

    if filters.get('from_date'):
        query = query.filter(RoomReservation.date_arrivee >= filters['from_date'])

    if filters.get('to_date'):
        query = query.filter(RoomReservation.date_depart <= filters['to_date'])

    # 🟨 Ici on filtre uniquement les chambres des hôtels que l'admin possède
    if admin_hotel_ids:
        query = query.filter(Room.hotel_id.in_(admin_hotel_ids))

    reservations = query.order_by(RoomReservation.date_arrivee.desc()).all()
    return reservations, None

# Services pour les réservations d'appartements
def create_apartment_reservation(apartment_id, reservation_data, user_id=None):
    """
    Crée une nouvelle réservation d'appartement
    """
    try:
        # Récupérer l'appartement
        apartment = Apartment.query.get(apartment_id)
        if not apartment:
            return None, "Appartement non trouvé"
        
        # Vérifier si l'appartement est disponible
        date_arrivee = reservation_data['date_arrivee']
        date_depart = reservation_data['date_depart']
        
        if not is_apartment_available(apartment_id, date_arrivee, date_depart):
            return None, "L'appartement n'est pas disponible pour les dates demandées"
        
        # Calculer le prix total
        prix_total, error = calculate_apartment_total_price(apartment, date_arrivee, date_depart)
        if error:
            return None, error
        
        # Créer la réservation
        reservation = ApartmentReservation(
            apartment_id=apartment_id,
            nom=reservation_data['nom'],
            prenom=reservation_data['prenom'],
            email=reservation_data['email'],
            date_arrivee=date_arrivee,
            date_depart=date_depart,
            nombre_personnes=reservation_data['nombre_personnes'],
            methode_paiement=reservation_data.get('methode_paiement'),
            statut=ReservationStatus.CONFIRMED,
            prix_total=prix_total,
            notes=reservation_data.get('notes'),
            user_id=user_id
        )
        
        db.session.add(reservation)
        db.session.commit()
        
        return reservation, None
    except SQLAlchemyError as e:
        current_app.logger.error(f"Erreur SQL lors de la création de la réservation: {str(e)}")
        db.session.rollback()
        return None, "Erreur de base de données"
    except Exception as e:
        current_app.logger.error(f"Erreur lors de la création de la réservation: {str(e)}")
        db.session.rollback()
        return None, str(e)

def update_apartment_reservation(reservation_id, reservation_data, user_id=None):
    """
    Met à jour une réservation d'appartement existante
    """
    try:
        # Récupérer la réservation
        reservation = ApartmentReservation.query.get(reservation_id)
        if not reservation:
            return None, "Réservation non trouvée"
        
        # Si l'utilisateur est fourni, vérifier qu'il est le propriétaire de la réservation
        if user_id and reservation.user_id != user_id:
            return None, "Vous n'avez pas les droits pour modifier cette réservation"
        
        # Si les dates changent, vérifier la disponibilité
        date_arrivee = reservation_data.get('date_arrivee', reservation.date_arrivee)
        date_depart = reservation_data.get('date_depart', reservation.date_depart)
        
        if date_arrivee != reservation.date_arrivee or date_depart != reservation.date_depart:
            if not is_apartment_available(reservation.apartment_id, date_arrivee, date_depart, exclude_reservation_id=reservation_id):
                return None, "L'appartement n'est pas disponible pour les nouvelles dates demandées"
            
            # Recalculer le prix total si les dates changent
            prix_total, error = calculate_apartment_total_price(reservation.apartment, date_arrivee, date_depart)
            if error:
                return None, error
            reservation.prix_total = prix_total
        
        # Mettre à jour les champs
        reservation.nom = reservation_data.get('nom', reservation.nom)
        reservation.prenom = reservation_data.get('prenom', reservation.prenom)
        reservation.email = reservation_data.get('email', reservation.email)
        reservation.date_arrivee = date_arrivee
        reservation.date_depart = date_depart
        reservation.nombre_personnes = reservation_data.get('nombre_personnes', reservation.nombre_personnes)
        
        if 'methode_paiement' in reservation_data:
            reservation.methode_paiement = reservation_data['methode_paiement']
        
        if 'statut' in reservation_data:
            if reservation_data['statut'] in VALID_RESERVATION_STATUSES:
                reservation.statut = reservation_data['statut']
            else:
                return None, f"Statut invalide. Valeurs possibles: {', '.join(VALID_RESERVATION_STATUSES)}"
        
        if 'notes' in reservation_data:
            reservation.notes = reservation_data['notes']
        
        db.session.commit()
        return reservation, None
    except SQLAlchemyError as e:
        current_app.logger.error(f"Erreur SQL lors de la mise à jour de la réservation: {str(e)}")
        db.session.rollback()
        return None, "Erreur de base de données"
    except Exception as e:
        current_app.logger.error(f"Erreur lors de la mise à jour de la réservation: {str(e)}")
        db.session.rollback()
        return None, str(e)

def cancel_apartment_reservation(reservation_id, user_id=None):
    """
    Annule une réservation d'appartement
    """
    try:
        # Récupérer la réservation
        reservation = ApartmentReservation.query.get(reservation_id)
        if not reservation:
            return False, "Réservation non trouvée"
        
        # Si l'utilisateur est fourni, vérifier qu'il est le propriétaire de la réservation
        if user_id and reservation.user_id != user_id:
            return False, "Vous n'avez pas les droits pour annuler cette réservation"
        
        # Mettre à jour le statut
        reservation.statut = ReservationStatus.CANCELLED
        
        db.session.commit()
        return True, None
    except Exception as e:
        current_app.logger.error(f"Erreur lors de l'annulation de la réservation: {str(e)}")
        db.session.rollback()
        return False, str(e)

def get_apartment_reservation(reservation_id, user_id=None):
    """
    Récupère les détails d'une réservation d'appartement
    """
    try:
        # Récupérer la réservation
        reservation = ApartmentReservation.query.get(reservation_id)
        if not reservation:
            return None, "Réservation non trouvée"
        
        # Si l'utilisateur est fourni, vérifier qu'il est le propriétaire de la réservation
        if user_id and reservation.user_id != user_id:
            return None, "Vous n'avez pas les droits pour consulter cette réservation"
        
        return reservation, None
    except Exception as e:
        current_app.logger.error(f"Erreur lors de la récupération de la réservation: {str(e)}")
        return None, str(e)

def search_apartment_reservations(filters, user_id=None, admin_hotel_ids=None):
    query = ApartmentReservation.query.join(Apartment)

    if user_id:
        query = query.filter(ApartmentReservation.user_id == user_id)

    if filters.get('apartment_id'):
        query = query.filter(ApartmentReservation.apartment_id == filters['apartment_id'])

    if filters.get('status'):
        query = query.filter(ApartmentReservation.statut == filters['status'])

    if filters.get('email'):
        query = query.filter(ApartmentReservation.email.ilike(f"%{filters['email']}%"))

    if filters.get('from_date'):
        query = query.filter(ApartmentReservation.date_arrivee >= filters['from_date'])

    if filters.get('to_date'):
        query = query.filter(ApartmentReservation.date_depart <= filters['to_date'])

    # 🟨 Filtrage des appartements appartenant aux hôtels de l'admin
    if admin_hotel_ids:
        query = query.filter(Apartment.hotel_id.in_(admin_hotel_ids))

    reservations = query.order_by(ApartmentReservation.date_arrivee.desc()).all()
    return reservations, None


# Services pour les réservations de salles d'événements
def create_event_room_reservation(event_room_id, reservation_data, user_id=None):
    """
    Crée une nouvelle réservation de salle d'événement
    """
    try:
        # Récupérer la salle d'événement
        event_room = EventRoom.query.get(event_room_id)
        if not event_room:
            return None, "Salle d'événement non trouvée"
        
        # Vérifier si la salle est disponible
        date_evenement = reservation_data['date_evenement']
        heure_debut = reservation_data['heure_debut']
        heure_fin = reservation_data['heure_fin']
        
        if not is_event_room_available(event_room_id, date_evenement, heure_debut, heure_fin):
            return None, "La salle n'est pas disponible pour la date et les heures demandées"
        
        # Calculer le prix total
        prix_total, error = calculate_event_room_total_price(event_room, heure_debut, heure_fin)
        if error:
            return None, error
        
        # Créer la réservation
        reservation = EventRoomReservation(
            event_room_id=event_room_id,
            nom=reservation_data['nom'],
            prenom=reservation_data['prenom'],
            email=reservation_data['email'],
            type_evenement=reservation_data['type_evenement'],
            date_evenement=date_evenement,
            heure_debut=heure_debut,
            heure_fin=heure_fin,
            nombre_invites=reservation_data['nombre_invites'],
            methode_paiement=reservation_data.get('methode_paiement'),
            statut=ReservationStatus.CONFIRMED,
            prix_total=prix_total,
            notes=reservation_data.get('notes'),
            user_id=user_id
        )
        
        db.session.add(reservation)
        db.session.commit()
        
        return reservation, None
    except SQLAlchemyError as e:
        current_app.logger.error(f"Erreur SQL lors de la création de la réservation: {str(e)}")
        db.session.rollback()
        return None, "Erreur de base de données"
    except Exception as e:
        current_app.logger.error(f"Erreur lors de la création de la réservation: {str(e)}")
        db.session.rollback()
        return None, str(e)

def update_event_room_reservation(reservation_id, reservation_data, user_id=None):
    """
    Met à jour une réservation de salle d'événement existante
    """
    try:
        # Récupérer la réservation
        reservation = EventRoomReservation.query.get(reservation_id)
        if not reservation:
            return None, "Réservation non trouvée"
        
        # Si l'utilisateur est fourni, vérifier qu'il est le propriétaire de la réservation
        if user_id and reservation.user_id != user_id:
            return None, "Vous n'avez pas les droits pour modifier cette réservation"
        
        # Si la date ou les heures changent, vérifier la disponibilité
        date_evenement = reservation_data.get('date_evenement', reservation.date_evenement)
        heure_debut = reservation_data.get('heure_debut', reservation.heure_debut)
        heure_fin = reservation_data.get('heure_fin', reservation.heure_fin)
        
        if (date_evenement != reservation.date_evenement or 
            heure_debut != reservation.heure_debut or 
            heure_fin != reservation.heure_fin):
            
            if not is_event_room_available(
                reservation.event_room_id, 
                date_evenement, 
                heure_debut, 
                heure_fin, 
                exclude_reservation_id=reservation_id
            ):
                return None, "La salle n'est pas disponible pour la nouvelle date et les nouvelles heures demandées"
            
            # Recalculer le prix total si les heures changent
            prix_total, error = calculate_event_room_total_price(reservation.event_room, heure_debut, heure_fin)
            if error:
                return None, error
            reservation.prix_total = prix_total
        
        # Mettre à jour les champs
        reservation.nom = reservation_data.get('nom', reservation.nom)
        reservation.prenom = reservation_data.get('prenom', reservation.prenom)
        reservation.email = reservation_data.get('email', reservation.email)
        reservation.date_evenement = date_evenement
        reservation.heure_debut = heure_debut
        reservation.heure_fin = heure_fin
        reservation.nombre_invites = reservation_data.get('nombre_invites', reservation.nombre_invites)
        
        if 'type_evenement' in reservation_data:
            reservation.type_evenement = reservation_data['type_evenement']
        
        if 'methode_paiement' in reservation_data:
            reservation.methode_paiement = reservation_data['methode_paiement']
        
        if 'statut' in reservation_data:
            if reservation_data['statut'] in VALID_RESERVATION_STATUSES:
                reservation.statut = reservation_data['statut']
            else:
                return None, f"Statut invalide. Valeurs possibles: {', '.join(VALID_RESERVATION_STATUSES)}"
        
        if 'notes' in reservation_data:
            reservation.notes = reservation_data['notes']
        
        db.session.commit()
        return reservation, None
    except SQLAlchemyError as e:
        current_app.logger.error(f"Erreur SQL lors de la mise à jour de la réservation: {str(e)}")
        db.session.rollback()
        return None, "Erreur de base de données"
    except Exception as e:
        current_app.logger.error(f"Erreur lors de la mise à jour de la réservation: {str(e)}")
        db.session.rollback()
        return None, str(e)

def cancel_event_room_reservation(reservation_id, user_id=None):
    """
    Annule une réservation de salle d'événement
    """
    try:
        # Récupérer la réservation
        reservation = EventRoomReservation.query.get(reservation_id)
        if not reservation:
            return False, "Réservation non trouvée"
        
        # Si l'utilisateur est fourni, vérifier qu'il est le propriétaire de la réservation
        if user_id and reservation.user_id != user_id:
            return False, "Vous n'avez pas les droits pour annuler cette réservation"
        
        # Mettre à jour le statut
        reservation.statut = ReservationStatus.CANCELLED
        
        db.session.commit()
        return True, None
    except Exception as e:
        current_app.logger.error(f"Erreur lors de l'annulation de la réservation: {str(e)}")
        db.session.rollback()
        return False, str(e)

def get_event_room_reservation(reservation_id, user_id=None):
    """
    Récupère les détails d'une réservation de salle d'événement
    """
    try:
        # Récupérer la réservation
        reservation = EventRoomReservation.query.get(reservation_id)
        if not reservation:
            return None, "Réservation non trouvée"
        
        # Si l'utilisateur est fourni, vérifier qu'il est le propriétaire de la réservation
        if user_id and reservation.user_id != user_id:
            return None, "Vous n'avez pas les droits pour consulter cette réservation"
        
        return reservation, None
    except Exception as e:
        current_app.logger.error(f"Erreur lors de la récupération de la réservation: {str(e)}")
        return None, str(e)

def search_event_room_reservations(filters, user_id=None, admin_hotel_ids=None):
    query = EventRoomReservation.query.join(EventRoom)

    if user_id:
        query = query.filter(EventRoomReservation.user_id == user_id)

    if filters.get('event_room_id'):
        query = query.filter(EventRoomReservation.event_room_id == filters['event_room_id'])

    if filters.get('status'):
        query = query.filter(EventRoomReservation.statut == filters['status'])

    if filters.get('email'):
        query = query.filter(EventRoomReservation.email.ilike(f"%{filters['email']}%"))

    if filters.get('from_date'):
        query = query.filter(EventRoomReservation.date_evenement >= filters['from_date'])

    if filters.get('to_date'):
        query = query.filter(EventRoomReservation.date_evenement <= filters['to_date'])

    # 🔐 Filtrer uniquement les hôtels de l’admin
    if admin_hotel_ids:
        query = query.filter(EventRoom.hotel_id.in_(admin_hotel_ids))

    reservations = query.order_by(EventRoomReservation.date_evenement.desc()).all()
    return reservations, None

    
    
# Dans email_service.py
def send_deletion_confirmation(email, reservation_type):
    """Envoie un email de confirmation de suppression"""
    subject = f"Confirmation annulation réservation {reservation_type}"
    body = f"Votre réservation de {reservation_type} a bien été annulée."
    # Implémentez ici l'envoi réel d'email    