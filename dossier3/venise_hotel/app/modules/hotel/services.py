from .models import Hotel, Room, EventRoom, Apartment
from app.extensions import db
from flask import current_app
from .utils import VALID_ROOM_TYPES, VALID_APARTMENT_TYPES, validate_hotel_stars
from app.modules.auth.models import User

def create_hotel(hotel_data):
    """Crée un nouvel hôtel assigné à un admin spécifique"""
    try:
        # Vérification que l'admin_id est fourni et valide
        admin_id = hotel_data.get('admin_id')
        if not admin_id:
            return None, "L'ID de l'administrateur est requis"
            
        admin = User.query.get(admin_id)
        if not admin or admin.role not in ['admin', 'superadmin']:
            return None, "Administrateur non valide ou non trouvé"
        
        hotel = Hotel(
            name=hotel_data['name'],
            description=hotel_data.get('description', ''),
            stars=hotel_data['stars'],
            email=hotel_data['email'],
            phone=hotel_data['phone'],
            website=hotel_data.get('website', ''),
            city=hotel_data['city'],
            country=hotel_data['country'],
            admin_id=admin_id
        )
        
        db.session.add(hotel)
        db.session.commit()
        
        # Ajout de l'hôtel à la liste des hôtels gérés par l'admin
        admin.managed_hotels.append(hotel)
        db.session.commit()
        
        return hotel, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur création hôtel: {str(e)}")
        db.session.rollback()
        return None, str(e)

def update_hotel(hotel_id, hotel_data):
    """Met à jour un hôtel existant"""
    try:
        hotel = Hotel.query.get(hotel_id)
        if not hotel:
            return None, "Hôtel non trouvé"
        
        # Mise à jour des champs
        hotel.name = hotel_data.get('name', hotel.name)
        hotel.description = hotel_data.get('description', hotel.description)
        hotel.stars = hotel_data.get('stars', hotel.stars)
        hotel.email = hotel_data.get('email', hotel.email)
        hotel.phone = hotel_data.get('phone', hotel.phone)
        hotel.website = hotel_data.get('website', hotel.website)
        hotel.city = hotel_data.get('city', hotel.city)
        hotel.country = hotel_data.get('country', hotel.country)
        
        # Changement d'admin si spécifié (seulement pour superadmin)
        if 'admin_id' in hotel_data:
            new_admin = User.query.get(hotel_data['admin_id'])
            if new_admin and new_admin.role in ['admin', 'superadmin']:
                # Retirer l'hôtel de l'ancien admin
                old_admin = hotel.admin
                if old_admin:
                    old_admin.managed_hotels.remove(hotel)
                
                # Assigner à nouveau admin
                hotel.admin_id = new_admin.id
                new_admin.managed_hotels.append(hotel)
        
        db.session.commit()
        return hotel, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur mise à jour hôtel: {str(e)}")
        db.session.rollback()
        return None, str(e)

def delete_hotel(hotel_id):
    """Supprime un hôtel et toutes ses dépendances"""
    try:
        hotel = Hotel.query.get(hotel_id)
        if not hotel:
            return False, "Hôtel non trouvé"
        
        # Retirer l'hôtel de la liste des hôtels gérés par l'admin
        admin = hotel.admin
        if admin:
            admin.managed_hotels.remove(hotel)
        
        db.session.delete(hotel)
        db.session.commit()
        return True, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur suppression hôtel: {str(e)}")
        db.session.rollback()
        return False, str(e)

def search_hotels(name=None, admin_id=None):
    """Recherche des hôtels avec filtres"""
    try:
        query = Hotel.query
        
        if name:
            query = query.filter(Hotel.name.ilike(f'%{name}%'))
            
        if admin_id:
            query = query.filter_by(admin_id=admin_id)
            
        hotels = query.all()
        return hotels, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur recherche hôtels: {str(e)}")
        return None, str(e)

def get_hotels_by_admin(admin_id):
    """Récupère tous les hôtels gérés par un admin spécifique"""
    try:
        admin = User.query.get(admin_id)
        if not admin:
            return None, "Admin non trouvé"
            
        # Pour un superadmin, retourner tous les hôtels
        if admin.role == 'superadmin':
            hotels = Hotel.query.all()
        else:
            hotels = admin.managed_hotels
            
        return hotels, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur récupération hôtels par admin: {str(e)}")
        return None, str(e)

# Services pour les chambres (inchangés mais avec vérification d'accès implicite via les routes)
def create_room(hotel_id, room_data):
    """Crée une nouvelle chambre pour l'hôtel spécifié"""
    try:
        hotel = Hotel.query.get(hotel_id)
        if not hotel:
            return None, "Hôtel non trouvé"
            
        room = Room(
            hotel_id=hotel_id,
            room_number=room_data['room_number'],
            description=room_data.get('description', ''),
            room_type=room_data['room_type'],
            capacity=room_data['capacity'],
            price_per_night=room_data['price_per_night'],
            is_available=room_data.get('is_available', True)
        )
        db.session.add(room)
        db.session.commit()
        return room, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur création chambre: {str(e)}")
        db.session.rollback()
        return None, str(e)

def update_room(room_id, room_data):
    """Met à jour une chambre existante"""
    try:
        room = Room.query.get(room_id)
        if not room:
            return None, "Chambre non trouvée"
        
        room.room_number = room_data.get('room_number', room.room_number)
        room.description = room_data.get('description', room.description)
        room.room_type = room_data.get('room_type', room.room_type)
        room.capacity = room_data.get('capacity', room.capacity)
        room.price_per_night = room_data.get('price_per_night', room.price_per_night)
        room.is_available = room_data.get('is_available', room.is_available)
        
        db.session.commit()
        return room, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur mise à jour chambre: {str(e)}")
        db.session.rollback()
        return None, str(e)

def delete_room(room_id):
    """Supprime une chambre"""
    try:
        room = Room.query.get(room_id)
        if not room:
            return False, "Chambre non trouvée"
            
        db.session.delete(room)
        db.session.commit()
        return True, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur suppression chambre: {str(e)}")
        db.session.rollback()
        return False, str(e)

def search_rooms(hotel_id=None, room_number=None):
    """Recherche des chambres avec filtres"""
    try:
        query = Room.query
        
        if hotel_id:
            query = query.filter_by(hotel_id=hotel_id)
            
        if room_number:
            query = query.filter(Room.room_number.ilike(f'%{room_number}%'))
            
        rooms = query.all()
        return rooms, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur recherche chambres: {str(e)}")
        return None, str(e)

# Services pour les salles de fête (inchangés mais avec vérification d'accès implicite via les routes)
def create_event_room(hotel_id, event_room_data):
    """Crée une nouvelle salle de fête"""
    try:
        hotel = Hotel.query.get(hotel_id)
        if not hotel:
            return None, "Hôtel non trouvé"
            
        event_room = EventRoom(
            hotel_id=hotel_id,
            name=event_room_data['name'],
            description=event_room_data.get('description', ''),
            capacity=event_room_data['capacity'],
            rental_price=event_room_data['rental_price'],
            is_available=event_room_data.get('is_available', True)
        )
        db.session.add(event_room)
        db.session.commit()
        return event_room, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur création salle de fête: {str(e)}")
        db.session.rollback()
        return None, str(e)

def update_event_room(event_room_id, event_room_data):
    """Met à jour une salle de fête existante"""
    try:
        event_room = EventRoom.query.get(event_room_id)
        if not event_room:
            return None, "Salle de fête non trouvée"
        
        event_room.name = event_room_data.get('name', event_room.name)
        event_room.description = event_room_data.get('description', event_room.description)
        event_room.capacity = event_room_data.get('capacity', event_room.capacity)
        event_room.rental_price = event_room_data.get('rental_price', event_room.rental_price)
        event_room.is_available = event_room_data.get('is_available', event_room.is_available)
        
        db.session.commit()
        return event_room, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur mise à jour salle de fête: {str(e)}")
        db.session.rollback()
        return None, str(e)

def delete_event_room(event_room_id):
    """Supprime une salle de fête"""
    try:
        event_room = EventRoom.query.get(event_room_id)
        if not event_room:
            return False, "Salle de fête non trouvée"
            
        db.session.delete(event_room)
        db.session.commit()
        return True, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur suppression salle de fête: {str(e)}")
        db.session.rollback()
        return False, str(e)

def search_event_rooms(hotel_id=None, name=None):
    """Recherche des salles de fête avec filtres"""
    try:
        query = EventRoom.query
        
        if hotel_id:
            query = query.filter_by(hotel_id=hotel_id)
            
        if name:
            query = query.filter(EventRoom.name.ilike(f'%{name}%'))
            
        event_rooms = query.all()
        return event_rooms, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur recherche salles de fête: {str(e)}")
        return None, str(e)

# Services pour les appartements (inchangés mais avec vérification d'accès implicite via les routes)
def create_apartment(hotel_id, apartment_data):
    """Crée un nouvel appartement"""
    try:
        hotel = Hotel.query.get(hotel_id)
        if not hotel:
            return None, "Hôtel non trouvé"
            
        apartment = Apartment(
            hotel_id=hotel_id,
            name=apartment_data['name'],
            description=apartment_data.get('description', ''),
            apartment_type=apartment_data['apartment_type'],
            capacity=apartment_data['capacity'],
            room_count=apartment_data['room_count'],
            has_wifi=apartment_data.get('has_wifi', False),
            price_per_night=apartment_data['price_per_night'],
            is_available=apartment_data.get('is_available', True)
        )
        db.session.add(apartment)
        db.session.commit()
        return apartment, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur création appartement: {str(e)}")
        db.session.rollback()
        return None, str(e)

def update_apartment(apartment_id, apartment_data):
    """Met à jour un appartement existant"""
    try:
        apartment = Apartment.query.get(apartment_id)
        if not apartment:
            return None, "Appartement non trouvé"
        
        apartment.name = apartment_data.get('name', apartment.name)
        apartment.description = apartment_data.get('description', apartment.description)
        apartment.apartment_type = apartment_data.get('apartment_type', apartment.apartment_type)
        apartment.capacity = apartment_data.get('capacity', apartment.capacity)
        apartment.room_count = apartment_data.get('room_count', apartment.room_count)
        apartment.has_wifi = apartment_data.get('has_wifi', apartment.has_wifi)
        apartment.price_per_night = apartment_data.get('price_per_night', apartment.price_per_night)
        apartment.is_available = apartment_data.get('is_available', apartment.is_available)
        
        db.session.commit()
        return apartment, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur mise à jour appartement: {str(e)}")
        db.session.rollback()
        return None, str(e)

def delete_apartment(apartment_id):
    """Supprime un appartement"""
    try:
        apartment = Apartment.query.get(apartment_id)
        if not apartment:
            return False, "Appartement non trouvé"
            
        db.session.delete(apartment)
        db.session.commit()
        return True, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur suppression appartement: {str(e)}")
        db.session.rollback()
        return False, str(e)

def search_apartments(hotel_id=None, name=None):
    """Recherche des appartements avec filtres"""
    try:
        query = Apartment.query
        
        if hotel_id:
            query = query.filter_by(hotel_id=hotel_id)
            
        if name:
            query = query.filter(Apartment.name.ilike(f'%{name}%'))
            
        apartments = query.all()
        return apartments, None
        
    except Exception as e:
        current_app.logger.error(f"Erreur recherche appartements: {str(e)}")
        return None, str(e)