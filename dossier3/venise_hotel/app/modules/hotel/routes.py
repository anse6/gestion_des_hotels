from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.modules.auth.models import User
from app import db
from .models import Hotel, Room, EventRoom, Apartment
from .services import (
    create_hotel, update_hotel, delete_hotel, search_hotels,
    create_room, update_room, delete_room, search_rooms,
    create_event_room, update_event_room, delete_event_room, search_event_rooms,
    create_apartment, update_apartment, delete_apartment, search_apartments
)
from .utils import VALID_ROOM_TYPES, VALID_APARTMENT_TYPES, validate_hotel_stars

hotel_bp = Blueprint('hotel', __name__, url_prefix='/api/hotel')

def get_current_user():
    """Récupère l'utilisateur actuellement connecté"""
    return User.query.filter_by(email=get_jwt_identity()).first()

def hotel_admin_required(hotel_id):
    """
    Vérifie que l'utilisateur est admin de l'hôtel ou superadmin
    Retourne None si autorisé, sinon retourne une réponse JSON d'erreur
    """
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Authentification requise"}), 401
    
    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({"error": "Hôtel non trouvé"}), 404
    
    # Superadmin a tous les droits
    if current_user.role == 'superadmin':
        return None
    
    # Vérifie que l'utilisateur est bien l'admin de cet hôtel
    if current_user.id != hotel.admin_id:
        return jsonify({"error": "Accès refusé. Vous n'êtes pas l'administrateur de cet hôtel"}), 403
    
    return None

# Routes pour les hôtels
@hotel_bp.route('/', methods=['POST'])
@jwt_required()
def add_hotel():
    # Seul un superadmin peut créer un hôtel
    current_user = get_current_user()
    if not current_user or current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé. Seul un superadmin peut créer un hôtel"}), 403
    
    data = request.get_json()
    
    # Validation des données
    required_fields = ['name', 'email', 'phone', 'city', 'country', 'admin_email']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Le champ {field} est obligatoire"}), 400
    
    # Vérification si l'hôtel existe déjà
    existing_hotel = Hotel.query.filter(
        (Hotel.name == data['name']) & 
        (Hotel.city == data['city']) & 
        (Hotel.country == data['country'])
    ).first()
    if existing_hotel:
        return jsonify({"error": "Un hôtel avec ce nom existe déjà dans cette ville et pays"}), 400
    
    # Validation des étoiles (1-5)
    stars = data.get('stars', 0)
    if not validate_hotel_stars(stars):
        return jsonify({"error": "Le nombre d'étoiles doit être entre 1 et 5"}), 400
    
    # Vérification de l'admin assigné
    admin = User.query.filter_by(email=data['admin_email'], role='admin').first()
    if not admin:
        return jsonify({"error": "Admin non trouvé ou non valide"}), 400
    
    # Vérification si l'admin gère déjà un hôtel
    if admin.managed_hotels and current_user.role != 'superadmin':
        return jsonify({"error": "Cet admin gère déjà un hôtel"}), 400
    
    # Création de l'hôtel avec l'admin_id
    hotel = Hotel(
        name=data['name'],
        description=data.get('description'),
        stars=stars,
        email=data['email'],
        phone=data['phone'],
        website=data.get('website'),
        city=data['city'],
        country=data['country'],
        admin_id=admin.id
    )
    
    try:
        db.session.add(hotel)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
        
    return jsonify({
        "message": "Hôtel créé avec succès et assigné à l'admin",
        "hotel": hotel.to_dict()
    }), 201

@hotel_bp.route('/my-hotels', methods=['GET'])
@jwt_required()
def get_my_hotels():
    """Retourne les hôtels gérés par l'utilisateur connecté"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Authentification requise"}), 401
    
    if current_user.role == 'superadmin':
        hotels = Hotel.query.all()
    else:
        hotels = current_user.managed_hotels
    
    return jsonify([hotel.to_dict() for hotel in hotels])

@hotel_bp.route('/', methods=['GET'])
def get_hotels():
    name = request.args.get('name')
    if name:
        hotels = Hotel.query.filter(Hotel.name.ilike(f'%{name}%')).all()
    else:
        hotels = Hotel.query.all()
    return jsonify([hotel.to_dict() for hotel in hotels])

@hotel_bp.route('/<int:hotel_id>', methods=['GET'])
def get_hotel(hotel_id):
    hotel = Hotel.query.get_or_404(hotel_id)
    return jsonify(hotel.to_dict())

@hotel_bp.route('/<int:hotel_id>', methods=['PUT'])
@jwt_required()
def modify_hotel(hotel_id):
    # Vérification des permissions
    auth_error = hotel_admin_required(hotel_id)
    if auth_error:
        return auth_error
    
    data = request.get_json()
    
    # Validation des étoiles si fournies
    if 'stars' in data and not validate_hotel_stars(data['stars']):
        return jsonify({"error": "Le nombre d'étoiles doit être entre 1 et 5"}), 400
    
    hotel = Hotel.query.get_or_404(hotel_id)
    
    # Mise à jour des champs
    for key, value in data.items():
        if hasattr(hotel, key) and key != 'id' and key != 'admin_id':
            setattr(hotel, key, value)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
        
    return jsonify({
        "message": "Hôtel mis à jour avec succès",
        "hotel": hotel.to_dict()
    })

@hotel_bp.route('/<int:hotel_id>', methods=['DELETE'])
@jwt_required()
def remove_hotel(hotel_id):
    # Vérification des permissions
    auth_error = hotel_admin_required(hotel_id)
    if auth_error:
        return auth_error
    
    hotel = Hotel.query.get_or_404(hotel_id)
    
    try:
        # Suppression en cascade grâce à cascade="all, delete-orphan" dans les relations
        db.session.delete(hotel)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
        
    return jsonify({"message": "Hôtel supprimé avec succès"})
# Routes pour les chambres
@hotel_bp.route('/<int:hotel_id>/rooms', methods=['POST'])
@jwt_required()
def add_room(hotel_id):
    # Vérification des permissions
    auth_error = hotel_admin_required(hotel_id)
    if auth_error:
        return auth_error
    
    data = request.get_json()
    
    # Validation des données
    if not data.get('room_number') or not data.get('room_type') or not data.get('price_per_night'):
        return jsonify({"error": "Les champs numéro, type et prix par nuit sont obligatoires"}), 400
    
    # Validation du type de chambre
    if data['room_type'] not in VALID_ROOM_TYPES:
        return jsonify({"error": f"Type de chambre invalide. Valeurs possibles: {', '.join(VALID_ROOM_TYPES)}"}), 400
    
    # Vérification si la chambre existe déjà
    existing_room = Room.query.filter_by(
        hotel_id=hotel_id,
        room_number=data['room_number']
    ).first()
    if existing_room:
        return jsonify({"error": "Une chambre avec ce numéro existe déjà dans cet hôtel"}), 400
    
    room, error = create_room(hotel_id, data)
    if error:
        return jsonify({"error": error}), 400
        
    return jsonify({
        "message": "Chambre créée avec succès",
        "room": room.to_dict()
    }), 201

@hotel_bp.route('/<int:hotel_id>/rooms', methods=['GET'])
def get_rooms(hotel_id):
    room_number = request.args.get('room_number')
    rooms, error = search_rooms(hotel_id=hotel_id, room_number=room_number)
    if error:
        return jsonify({"error": error}), 500
        
    return jsonify([room.to_dict() for room in rooms])

@hotel_bp.route('/rooms/<int:room_id>', methods=['GET'])
def get_room(room_id):
    room = Room.query.get_or_404(room_id)
    return jsonify(room.to_dict())

@hotel_bp.route('/rooms/<int:room_id>', methods=['PUT'])
@jwt_required()
def modify_room(room_id):
    room = Room.query.get_or_404(room_id)
    
    # Vérification des permissions
    auth_error = hotel_admin_required(room.hotel_id)
    if auth_error:
        return auth_error
    
    data = request.get_json()
    
    # Validation du type de chambre si fourni
    if 'room_type' in data and data['room_type'] not in VALID_ROOM_TYPES:
        return jsonify({"error": f"Type de chambre invalide. Valeurs possibles: {', '.join(VALID_ROOM_TYPES)}"}), 400
    
    # Vérification si le nouveau numéro existe déjà
    if 'room_number' in data and data['room_number'] != room.room_number:
        existing_room = Room.query.filter_by(
            hotel_id=room.hotel_id,
            room_number=data['room_number']
        ).first()
        if existing_room:
            return jsonify({"error": "Une chambre avec ce numéro existe déjà dans cet hôtel"}), 400
    
    room, error = update_room(room_id, data)
    if error:
        return jsonify({"error": error}), 400 if "non trouvée" in error else 500
        
    return jsonify({
        "message": "Chambre mise à jour avec succès",
        "room": room.to_dict()
    })

@hotel_bp.route('/rooms/<int:room_id>', methods=['DELETE'])
@jwt_required()
def remove_room(room_id):
    room = Room.query.get_or_404(room_id)
    
    # Vérification des permissions
    auth_error = hotel_admin_required(room.hotel_id)
    if auth_error:
        return auth_error
    
    success, error = delete_room(room_id)
    if error:
        return jsonify({"error": error}), 400 if "non trouvée" in error else 500
        
    return jsonify({"message": "Chambre supprimée avec succès"})

# Routes pour les salles de fête
@hotel_bp.route('/<int:hotel_id>/event-rooms', methods=['POST'])
@jwt_required()
def add_event_room(hotel_id):
    # Vérification des permissions
    auth_error = hotel_admin_required(hotel_id)
    if auth_error:
        return auth_error
    
    data = request.get_json()
    
    # Validation des données
    if not data.get('name') or not data.get('capacity') or not data.get('rental_price'):
        return jsonify({"error": "Les champs nom, capacité et prix de location sont obligatoires"}), 400
    
    # Vérification si la salle existe déjà
    existing_event_room = EventRoom.query.filter_by(
        hotel_id=hotel_id,
        name=data['name']
    ).first()
    if existing_event_room:
        return jsonify({"error": "Une salle avec ce nom existe déjà dans cet hôtel"}), 400
    
    event_room, error = create_event_room(hotel_id, data)
    if error:
        return jsonify({"error": error}), 400
        
    return jsonify({
        "message": "Salle de fête créée avec succès",
        "event_room": event_room.to_dict()
    }), 201

@hotel_bp.route('/<int:hotel_id>/event-rooms', methods=['GET'])
def get_event_rooms(hotel_id):
    name = request.args.get('name')
    event_rooms, error = search_event_rooms(hotel_id=hotel_id, name=name)
    if error:
        return jsonify({"error": error}), 500
        
    return jsonify([er.to_dict() for er in event_rooms])

@hotel_bp.route('/event-rooms/<int:event_room_id>', methods=['GET'])
def get_event_room(event_room_id):
    event_room = EventRoom.query.get_or_404(event_room_id)
    return jsonify(event_room.to_dict())

@hotel_bp.route('/event-rooms/<int:event_room_id>', methods=['PUT'])
@jwt_required()
def modify_event_room(event_room_id):
    event_room = EventRoom.query.get_or_404(event_room_id)
    
    # Vérification des permissions
    auth_error = hotel_admin_required(event_room.hotel_id)
    if auth_error:
        return auth_error
    
    data = request.get_json()
    
    # Vérification si le nouveau nom existe déjà
    if 'name' in data and data['name'] != event_room.name:
        existing_event_room = EventRoom.query.filter_by(
            hotel_id=event_room.hotel_id,
            name=data['name']
        ).first()
        if existing_event_room:
            return jsonify({"error": "Une salle avec ce nom existe déjà dans cet hôtel"}), 400
    
    event_room, error = update_event_room(event_room_id, data)
    if error:
        return jsonify({"error": error}), 400 if "non trouvée" in error else 500
        
    return jsonify({
        "message": "Salle de fête mise à jour avec succès",
        "event_room": event_room.to_dict()
    })

@hotel_bp.route('/event-rooms/<int:event_room_id>', methods=['DELETE'])
@jwt_required()
def remove_event_room(event_room_id):
    event_room = EventRoom.query.get_or_404(event_room_id)
    
    # Vérification des permissions
    auth_error = hotel_admin_required(event_room.hotel_id)
    if auth_error:
        return auth_error
    
    success, error = delete_event_room(event_room_id)
    if error:
        return jsonify({"error": error}), 400 if "non trouvée" in error else 500
        
    return jsonify({"message": "Salle de fête supprimée avec succès"})

# Routes pour les appartements
@hotel_bp.route('/<int:hotel_id>/apartments', methods=['POST'])
@jwt_required()
def add_apartment(hotel_id):
    # Vérification des permissions
    auth_error = hotel_admin_required(hotel_id)
    if auth_error:
        return auth_error
    
    data = request.get_json()
    
    # Validation des données
    if not data.get('name') or not data.get('apartment_type') or not data.get('price_per_night'):
        return jsonify({"error": "Les champs nom, type et prix par nuit sont obligatoires"}), 400
    
    # Validation du type d'appartement
    if data['apartment_type'] not in VALID_APARTMENT_TYPES:
        return jsonify({"error": f"Type d'appartement invalide. Valeurs possibles: {', '.join(VALID_APARTMENT_TYPES)}"}), 400
    
    # Vérification si l'appartement existe déjà
    existing_apartment = Apartment.query.filter_by(
        hotel_id=hotel_id,
        name=data['name']
    ).first()
    if existing_apartment:
        return jsonify({"error": "Un appartement avec ce nom existe déjà dans cet hôtel"}), 400
    
    apartment, error = create_apartment(hotel_id, data)
    if error:
        return jsonify({"error": error}), 400
        
    return jsonify({
        "message": "Appartement créé avec succès",
        "apartment": apartment.to_dict()
    }), 201

@hotel_bp.route('/<int:hotel_id>/apartments', methods=['GET'])
def get_apartments(hotel_id):
    name = request.args.get('name')
    apartments, error = search_apartments(hotel_id=hotel_id, name=name)
    if error:
        return jsonify({"error": error}), 500
        
    return jsonify([apt.to_dict() for apt in apartments])

@hotel_bp.route('/apartments/<int:apartment_id>', methods=['GET'])
def get_apartment(apartment_id):
    apartment = Apartment.query.get_or_404(apartment_id)
    return jsonify(apartment.to_dict())

@hotel_bp.route('/apartments/<int:apartment_id>', methods=['PUT'])
@jwt_required()
def modify_apartment(apartment_id):
    apartment = Apartment.query.get_or_404(apartment_id)
    
    # Vérification des permissions
    auth_error = hotel_admin_required(apartment.hotel_id)
    if auth_error:
        return auth_error
    
    data = request.get_json()
    
    # Validation du type d'appartement si fourni
    if 'apartment_type' in data and data['apartment_type'] not in VALID_APARTMENT_TYPES:
        return jsonify({"error": f"Type d'appartement invalide. Valeurs possibles: {', '.join(VALID_APARTMENT_TYPES)}"}), 400
    
    # Vérification si le nouveau nom existe déjà
    if 'name' in data and data['name'] != apartment.name:
        existing_apartment = Apartment.query.filter_by(
            hotel_id=apartment.hotel_id,
            name=data['name']
        ).first()
        if existing_apartment:
            return jsonify({"error": "Un appartement avec ce nom existe déjà dans cet hôtel"}), 400
    
    apartment, error = update_apartment(apartment_id, data)
    if error:
        return jsonify({"error": error}), 400 if "non trouvé" in error else 500
        
    return jsonify({
        "message": "Appartement mis à jour avec succès",
        "apartment": apartment.to_dict()
    })

@hotel_bp.route('/apartments/<int:apartment_id>', methods=['DELETE'])
@jwt_required()
def remove_apartment(apartment_id):
    apartment = Apartment.query.get_or_404(apartment_id)
    
    # Vérification des permissions
    auth_error = hotel_admin_required(apartment.hotel_id)
    if auth_error:
        return auth_error
    
    success, error = delete_apartment(apartment_id)
    if error:
        return jsonify({"error": error}), 400 if "non trouvé" in error else 500
        
    return jsonify({"message": "Appartement supprimé avec succès"})



# les statistique 

#hotel_bp = Blueprint('hotel_bp', __name__, url_prefix='/hotels')

@hotel_bp.route('/occupation-stats', methods=['GET'])
@jwt_required()
def get_occupation_stats():
    """
    Renvoie le nombre total de chambres, salles de fête et appartements 
    présents dans tous les hôtels (ou tu peux filtrer selon besoin).
    """
    try:
        total_rooms = db.session.query(Room).count()
        total_event_rooms = db.session.query(EventRoom).count()
        total_apartments = db.session.query(Apartment).count()

        return jsonify({
            "rooms": total_rooms,
            "event_rooms": total_event_rooms,
            "apartments": total_apartments
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
# statistique 2   pour le nombre d'hotel creer 


@hotel_bp.route('/count', methods=['GET'])
@jwt_required()
def count_hotels():
    current_user = get_current_user()

    if current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403

    total_hotels = Hotel.query.count()
    objectif = 100  # Tu peux modifier cette valeur selon ton besoin
    pourcentage = round((total_hotels / objectif) * 100, 2)

    return jsonify({
        "total_hotels": total_hotels,
        "objectif": objectif,
        "progression": f"{pourcentage}%"
    })
    
    
    
    
    
    
# Ajoutez cette route dans votre fichier routes.py (hotel_bp)

@hotel_bp.route('/revenue-stats', methods=['GET'])
@jwt_required()
def get_revenue_stats():
    """
    Renvoie les statistiques de revenus par hôtel avec objectifs et progression
    """
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "Authentification requise"}), 401
        
        # Récupération des hôtels selon le rôle
        if current_user.role == 'superadmin':
            hotels = Hotel.query.all()
        else:
            hotels = current_user.managed_hotels
        
        revenue_data = []
        
        for hotel in hotels:
            # Calcul du revenu actuel (exemple avec des données simulées)
            # Vous devrez adapter selon votre logique métier réelle
            
            # Simulation du calcul de revenus
            # Dans un cas réel, vous calculeriez depuis les réservations
            total_rooms = len(hotel.rooms)
            total_apartments = len(hotel.apartments) if hasattr(hotel, 'apartments') else 0
            total_event_rooms = len(hotel.event_rooms) if hasattr(hotel, 'event_rooms') else 0
            
            # Calcul simulé du revenu (à adapter selon votre logique)
            base_revenue = (total_rooms * 50000) + (total_apartments * 80000) + (total_event_rooms * 30000)
            
            # Objectif basé sur la capacité de l'hôtel
            target_revenue = base_revenue * 1.2  # 20% de plus que la base
            
            # Calcul du pourcentage de progression
            percentage = round((base_revenue / target_revenue) * 100) if target_revenue > 0 else 0
            
            revenue_data.append({
                "hotel_id": hotel.id,
                "hotel_name": hotel.name,
                "current_revenue": base_revenue,
                "target_revenue": target_revenue,
                "percentage": percentage,
                "city": hotel.city,
                "country": hotel.country
            })
        
        return jsonify({
            "success": True,
            "data": revenue_data,
            "total_hotels": len(revenue_data),
            "total_current_revenue": sum(item["current_revenue"] for item in revenue_data),
            "total_target_revenue": sum(item["target_revenue"] for item in revenue_data)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Alternative avec des données plus réalistes (si vous avez une table de réservations)
@hotel_bp.route('/revenue-stats-detailed', methods=['GET'])
@jwt_required()
def get_detailed_revenue_stats():
    """
    Version plus détaillée avec calcul de revenus réels
    (nécessite une table de réservations/bookings)
    """
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "Authentification requise"}), 401
        
        # Récupération des hôtels selon le rôle
        if current_user.role == 'superadmin':
            hotels = Hotel.query.all()
        else:
            hotels = current_user.managed_hotels
        
        revenue_data = []
        
        for hotel in hotels:
            # Calcul du revenu des chambres
            room_revenue = 0
            for room in hotel.rooms:
                # Ici vous calculeriez le revenu réel depuis les réservations
                # Exemple : room_revenue += sum(booking.total_amount for booking in room.bookings)
                room_revenue += room.price_per_night * 20  # Simulation : 20 nuits vendues
            
            # Calcul du revenu des appartements
            apartment_revenue = 0
            if hasattr(hotel, 'apartments'):
                for apartment in hotel.apartments:
                    apartment_revenue += apartment.price_per_night * 15  # Simulation
            
            # Calcul du revenu des salles de fête
            event_revenue = 0
            if hasattr(hotel, 'event_rooms'):
                for event_room in hotel.event_rooms:
                    event_revenue += event_room.rental_price * 5  # Simulation : 5 événements
            
            total_revenue = room_revenue + apartment_revenue + event_revenue
            
            # Objectif basé sur la capacité théorique
            theoretical_capacity = (len(hotel.rooms) * 80000) + (len(hotel.apartments) * 120000) + (len(hotel.event_rooms) * 50000)
            target_revenue = theoretical_capacity * 0.8  # 80% de la capacité théorique
            
            percentage = round((total_revenue / target_revenue) * 100) if target_revenue > 0 else 0
            
            revenue_data.append({
                "hotel_id": hotel.id,
                "hotel_name": hotel.name,
                "current_revenue": total_revenue,
                "target_revenue": target_revenue,
                "percentage": percentage,
                "breakdown": {
                    "room_revenue": room_revenue,
                    "apartment_revenue": apartment_revenue,
                    "event_revenue": event_revenue
                },
                "capacity_info": {
                    "total_rooms": len(hotel.rooms),
                    "total_apartments": len(hotel.apartments) if hasattr(hotel, 'apartments') else 0,
                    "total_event_rooms": len(hotel.event_rooms) if hasattr(hotel, 'event_rooms') else 0
                }
            })
        
        return jsonify({
            "success": True,
            "data": revenue_data,
            "summary": {
                "total_hotels": len(revenue_data),
                "total_current_revenue": sum(item["current_revenue"] for item in revenue_data),
                "total_target_revenue": sum(item["target_revenue"] for item in revenue_data),
                "overall_percentage": round((sum(item["current_revenue"] for item in revenue_data) / sum(item["target_revenue"] for item in revenue_data)) * 100) if sum(item["target_revenue"] for item in revenue_data) > 0 else 0
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500    
    
    
    
    
    







