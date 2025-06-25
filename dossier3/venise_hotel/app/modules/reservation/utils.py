from datetime import datetime, timedelta
from .models import RoomReservation, ApartmentReservation, EventRoomReservation

class ReservationStatus:
    PENDING = 'en attente'
    CONFIRMED = 'confirmée'
    CANCELLED = 'annulée'
    COMPLETED = 'terminée'

class PaymentMethod:
    CASH = 'espèces'
    CARD = 'carte'
    MOBILE_MONEY = 'mobile money'
    BANK_TRANSFER = 'virement bancaire'
    PAYPAL = 'paypal'

class EventType:
    WEDDING = 'mariage'
    BIRTHDAY = 'anniversaire'
    CONFERENCE = 'conférence'
    BAPTISM = 'baptême'
    SEMINAR = 'séminaire'
    PARTY = 'fête'
    OTHER = 'autre'

# Liste des méthodes de paiement valides
VALID_PAYMENT_METHODS = [
    PaymentMethod.CASH,
    PaymentMethod.CARD,
    PaymentMethod.MOBILE_MONEY,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.PAYPAL
]

# Liste des statuts de réservation valides
VALID_RESERVATION_STATUSES = [
    ReservationStatus.PENDING,
    ReservationStatus.CONFIRMED,
    ReservationStatus.CANCELLED,
    ReservationStatus.COMPLETED
]

# Liste des types d'événements valides
VALID_EVENT_TYPES = [
    EventType.WEDDING,
    EventType.BIRTHDAY,
    EventType.CONFERENCE,
    EventType.BAPTISM,
    EventType.SEMINAR,
    EventType.PARTY,
    EventType.OTHER
]

def calculate_room_total_price(room, check_in_date, check_out_date):
    """
    Calcule le prix total pour une réservation de chambre
    basé sur le prix par nuit et la durée du séjour
    
    Args:
        room: Objet Room
        check_in_date: Date d'arrivée (str ou date)
        check_out_date: Date de départ (str ou date)
    
    Returns:
        tuple: (prix_total, erreur) ou (None, message_erreur)
    """
    try:
        # Convertir les dates en objets date si elles sont des strings
        if isinstance(check_in_date, str):
            check_in_date = datetime.strptime(check_in_date, '%Y-%m-%d').date()
        if isinstance(check_out_date, str):
            check_out_date = datetime.strptime(check_out_date, '%Y-%m-%d').date()
        
        # Calculer le nombre de nuits
        delta = (check_out_date - check_in_date).days
        
        if delta <= 0:
            raise ValueError("La date de départ doit être postérieure à la date d'arrivée")
        
        # Calculer le prix total
        total_price = room.price_per_night * delta
        
        return round(total_price, 2), None
    except ValueError as e:
        return None, f"Erreur de format de date: {str(e)}"
    except Exception as e:
        return None, f"Erreur de calcul: {str(e)}"

def calculate_apartment_total_price(apartment, check_in_date, check_out_date):
    """
    Calcule le prix total pour une réservation d'appartement
    basé sur le prix par nuit et la durée du séjour
    
    Args:
        apartment: Objet Apartment
        check_in_date: Date d'arrivée (str ou date)
        check_out_date: Date de départ (str ou date)
    
    Returns:
        tuple: (prix_total, erreur) ou (None, message_erreur)
    """
    try:
        # Convertir les dates en objets date si elles sont des strings
        if isinstance(check_in_date, str):
            check_in_date = datetime.strptime(check_in_date, '%Y-%m-%d').date()
        if isinstance(check_out_date, str):
            check_out_date = datetime.strptime(check_out_date, '%Y-%m-%d').date()
        
        # Calculer le nombre de nuits
        delta = (check_out_date - check_in_date).days
        
        if delta <= 0:
            raise ValueError("La date de départ doit être postérieure à la date d'arrivée")
        
        # Calculer le prix total
        total_price = apartment.price_per_night * delta
        
        return round(total_price, 2), None
    except ValueError as e:
        return None, f"Erreur de format de date: {str(e)}"
    except Exception as e:
        return None, f"Erreur de calcul: {str(e)}"

def calculate_event_room_total_price(event_room, start_time, end_time):
    """
    Calcule le prix total pour une réservation de salle d'événement
    basé sur le prix de location et la durée de l'événement
    
    Args:
        event_room: Objet EventRoom
        start_time: Heure de début (str ou time)
        end_time: Heure de fin (str ou time)
    
    Returns:
        tuple: (prix_total, erreur) ou (None, message_erreur)
    """
    try:
        # Convertir les heures en objets time si elles sont des strings
        if isinstance(start_time, str):
            start_time = datetime.strptime(start_time, '%H:%M').time()
        if isinstance(end_time, str):
            end_time = datetime.strptime(end_time, '%H:%M').time()
        
        # Convertir en datetime complet pour calculer la différence
        base_date = datetime.today().date()
        start_datetime = datetime.combine(base_date, start_time)
        end_datetime = datetime.combine(base_date, end_time)
        
        # Si l'heure de fin est antérieure à l'heure de début, supposons que c'est le jour suivant
        if end_datetime < start_datetime:
            end_datetime += timedelta(days=1)
        
        # Calculer la durée en heures
        duration_hours = (end_datetime - start_datetime).total_seconds() / 3600
        
        if duration_hours <= 0:
            raise ValueError("L'heure de fin doit être postérieure à l'heure de début")
        
        # Calculer le prix total (ici on utilise le prix fixe pour l'événement)
        # Pour un prix horaire, utiliser: total_price = event_room.rental_price * duration_hours
        total_price = event_room.rental_price
        
        return round(total_price, 2), None
    except ValueError as e:
        return None, f"Erreur de format d'heure: {str(e)}"
    except Exception as e:
        return None, f"Erreur de calcul: {str(e)}"

def is_room_available(room_id, check_in_date, check_out_date, exclude_reservation_id=None):
    """
    Vérifie si une chambre est disponible pour les dates demandées
    
    Args:
        room_id: ID de la chambre
        check_in_date: Date d'arrivée
        check_out_date: Date de départ
        exclude_reservation_id: ID de réservation à exclure (pour les mises à jour)
    
    Returns:
        bool: True si disponible, False sinon
    """
    # Convertir les dates en objets date si elles sont des strings
    if isinstance(check_in_date, str):
        check_in_date = datetime.strptime(check_in_date, '%Y-%m-%d').date()
    if isinstance(check_out_date, str):
        check_out_date = datetime.strptime(check_out_date, '%Y-%m-%d').date()
    
    # Requête pour trouver des réservations existantes qui chevauchent la période demandée
    query = RoomReservation.query.filter(
        RoomReservation.room_id == room_id,
        RoomReservation.statut != ReservationStatus.CANCELLED,
        RoomReservation.date_depart > check_in_date,
        RoomReservation.date_arrivee < check_out_date
    )
    
    # Exclure la réservation actuelle en cas de mise à jour
    if exclude_reservation_id:
        query = query.filter(RoomReservation.id != exclude_reservation_id)
    
    # Si des réservations existent pour cette période, la chambre n'est pas disponible
    return query.count() == 0

def is_apartment_available(apartment_id, check_in_date, check_out_date, exclude_reservation_id=None):
    """
    Vérifie si un appartement est disponible pour les dates demandées
    
    Args:
        apartment_id: ID de l'appartement
        check_in_date: Date d'arrivée
        check_out_date: Date de départ
        exclude_reservation_id: ID de réservation à exclure (pour les mises à jour)
    
    Returns:
        bool: True si disponible, False sinon
    """
    # Convertir les dates en objets date si elles sont des strings
    if isinstance(check_in_date, str):
        check_in_date = datetime.strptime(check_in_date, '%Y-%m-%d').date()
    if isinstance(check_out_date, str):
        check_out_date = datetime.strptime(check_out_date, '%Y-%m-%d').date()
    
    # Requête pour trouver des réservations existantes qui chevauchent la période demandée
    query = ApartmentReservation.query.filter(
        ApartmentReservation.apartment_id == apartment_id,
        ApartmentReservation.statut != ReservationStatus.CANCELLED,
        ApartmentReservation.date_depart > check_in_date,
        ApartmentReservation.date_arrivee < check_out_date
    )
    
    # Exclure la réservation actuelle en cas de mise à jour
    if exclude_reservation_id:
        query = query.filter(ApartmentReservation.id != exclude_reservation_id)
    
    # Si des réservations existent pour cette période, l'appartement n'est pas disponible
    return query.count() == 0

def is_event_room_available(event_room_id, event_date, start_time, end_time, exclude_reservation_id=None):
    """
    Vérifie si une salle d'événement est disponible pour la date et les heures demandées
    
    Args:
        event_room_id: ID de la salle d'événement
        event_date: Date de l'événement
        start_time: Heure de début
        end_time: Heure de fin
        exclude_reservation_id: ID de réservation à exclure (pour les mises à jour)
    
    Returns:
        bool: True si disponible, False sinon
    """
    # Convertir la date en objet date si c'est une string
    if isinstance(event_date, str):
        event_date = datetime.strptime(event_date, '%Y-%m-%d').date()
    
    # Convertir les heures en objets time si elles sont des strings
    if isinstance(start_time, str):
        start_time = datetime.strptime(start_time, '%H:%M').time()
    if isinstance(end_time, str):
        end_time = datetime.strptime(end_time, '%H:%M').time()
    
    # Requête pour trouver des réservations existantes à la même date
    query = EventRoomReservation.query.filter(
        EventRoomReservation.event_room_id == event_room_id,
        EventRoomReservation.statut != ReservationStatus.CANCELLED,
        EventRoomReservation.date_evenement == event_date
    )
    
    # Exclure la réservation actuelle en cas de mise à jour
    if exclude_reservation_id:
        query = query.filter(EventRoomReservation.id != exclude_reservation_id)
    
    # Vérifier le chevauchement des heures pour chaque réservation existante
    for reservation in query.all():
        # Convertir les heures de la réservation existante en datetime pour comparaison
        existing_start = datetime.combine(event_date, reservation.heure_debut)
        existing_end = datetime.combine(event_date, reservation.heure_fin)
        
        # Convertir les heures demandées en datetime pour comparaison
        requested_start = datetime.combine(event_date, start_time)
        requested_end = datetime.combine(event_date, end_time)
        
        # Vérifier les chevauchements
        if (requested_start < existing_end and requested_end > existing_start):
            return False
    
    return True