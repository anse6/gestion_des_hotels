# Constantes pour les types de chambres et appartements
VALID_ROOM_TYPES = ['simple', 'double', 'suite', 'familiale', 'executive', 'deluxe']
VALID_APARTMENT_TYPES = ['studio', 'F1', 'F2', 'F3', 'F4', 'duplex', 'penthouse']
VALID_HOTEL_AMENITIES = ['wifi', 'piscine', 'spa', 'restaurant', 'room_service', 'gym', 'parking']

# Constantes pour les capacités
MIN_ROOM_CAPACITY = 1
MAX_ROOM_CAPACITY = 6
MIN_APARTMENT_CAPACITY = 1
MAX_APARTMENT_CAPACITY = 10

def validate_hotel_stars(stars):
    """Valide le nombre d'étoiles d'un hôtel (1-5)"""
    try:
        stars_int = int(stars)
        return 1 <= stars_int <= 5
    except (ValueError, TypeError):
        return False

def validate_room_type(room_type):
    """Valide que le type de chambre est valide"""
    return room_type in VALID_ROOM_TYPES

def validate_apartment_type(apartment_type):
    """Valide que le type d'appartement est valide"""
    return apartment_type in VALID_APARTMENT_TYPES

def validate_capacity(capacity, is_room=True):
    """
    Valide la capacité d'une chambre ou d'un appartement
    is_room=True pour une chambre, False pour un appartement
    """
    try:
        capacity_int = int(capacity)
        if is_room:
            return MIN_ROOM_CAPACITY <= capacity_int <= MAX_ROOM_CAPACITY
        else:
            return MIN_APARTMENT_CAPACITY <= capacity_int <= MAX_APARTMENT_CAPACITY
    except (ValueError, TypeError):
        return False

def format_phone_number(phone):
    """Formate un numéro de téléphone international"""
    if not phone:
        return ""
    
    # Nettoyage du numéro
    cleaned = ''.join(c for c in str(phone) if c.isdigit())
    
    # Formatage basique pour les numéros français
    if len(cleaned) == 10 and cleaned.startswith('0'):
        return f"+33 {cleaned[1:]}"
    
    # Formatage international générique
    if len(cleaned) > 3:
        return f"+{cleaned}"
    
    return phone

def validate_email(email):
    """Validation basique d'email"""
    if not email or '@' not in email or '.' not in email:
        return False
    return True

def validate_price(price):
    """Valide qu'un prix est positif"""
    try:
        price_float = float(price)
        return price_float >= 0
    except (ValueError, TypeError):
        return False

def validate_amenities(amenities):
    """
    Valide que les équipements fournis sont valides
    amenities: liste des équipements à valider
    """
    if not isinstance(amenities, list):
        return False
    return all(amenity in VALID_HOTEL_AMENITIES for amenity in amenities)

def generate_hotel_code(name, city):
    """
    Génère un code unique pour un hôtel à partir de son nom et ville
    Ex: "Hôtel Paris" -> "HOPA-1234"
    """
    from random import randint
    if not name or not city:
        return None
    
    # Prendre les 2 premières lettres de chaque mot
    name_part = ''.join([word[:2].upper() for word in name.split()[:2]])
    city_part = ''.join([word[:2].upper() for word in city.split()[:2]])
    
    # Limiter à 4 caractères au total
    code_base = (name_part + city_part)[:4]
    random_num = randint(1000, 9999)
    
    return f"{code_base}-{random_num}"

def validate_website(url):
    """Validation basique d'URL de site web"""
    if not url:
        return True  # Optionnel
    
    url = str(url).lower()
    return (url.startswith('http://') or url.startswith('https://')) and '.' in url