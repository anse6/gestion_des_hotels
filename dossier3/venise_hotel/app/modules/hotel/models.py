from app.extensions import db
from datetime import datetime

class Hotel(db.Model):
    __tablename__ = 'hotels'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    stars = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    website = db.Column(db.String(200), nullable=True)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Clé étrangère vers l'admin
    
    # Relations
    admin = db.relationship('User', backref='managed_hotels')  # Relation avec l'admin
    rooms = db.relationship('Room', backref='hotel', lazy=True, cascade="all, delete-orphan")
    events_rooms = db.relationship('EventRoom', backref='hotel', lazy=True, cascade="all, delete-orphan")
    apartments = db.relationship('Apartment', backref='hotel', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "stars": self.stars,
            "email": self.email,
            "phone": self.phone,
            "website": self.website,
            "city": self.city,
            "country": self.country,
            "admin_id": self.admin_id,
            "created_at": self.created_at.isoformat()
        }

class Room(db.Model):
    __tablename__ = 'rooms'

    id = db.Column(db.Integer, primary_key=True)
    room_number = db.Column(db.String(10), nullable=False)
    description = db.Column(db.Text, nullable=True)
    room_type = db.Column(db.String(50), nullable=False)  # simple, double, suite, familiale, etc.
    capacity = db.Column(db.Integer, nullable=False)
    price_per_night = db.Column(db.Float, nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Clé étrangère
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'), nullable=False)

    # Relation avec les réservations
    room_reservations = db.relationship('RoomReservation', back_populates='room', cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "room_number": self.room_number,
            "description": self.description,
            "room_type": self.room_type,
            "capacity": self.capacity,
            "price_per_night": self.price_per_night,
            "is_available": self.is_available,
            "hotel_id": self.hotel_id,
            "created_at": self.created_at.isoformat()
        }

class EventRoom(db.Model):
    __tablename__ = 'event_rooms'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    capacity = db.Column(db.Integer, nullable=False)
    rental_price = db.Column(db.Float, nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Clé étrangère
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'), nullable=False)

    # Relation avec les réservations
    event_room_reservations = db.relationship('EventRoomReservation', back_populates='event_room', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "capacity": self.capacity,
            "rental_price": self.rental_price,
            "is_available": self.is_available,
            "hotel_id": self.hotel_id,
            "created_at": self.created_at.isoformat()
        }

class Apartment(db.Model):
    __tablename__ = 'apartments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    apartment_type = db.Column(db.String(50), nullable=False)  # studio, F2, duplex, etc.
    capacity = db.Column(db.Integer, nullable=False)
    room_count = db.Column(db.Integer, nullable=False)
    has_wifi = db.Column(db.Boolean, default=False)
    price_per_night = db.Column(db.Float, nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Clé étrangère
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'), nullable=False)

    # Relation avec les réservations
    apartment_reservations = db.relationship('ApartmentReservation', back_populates='apartment', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "apartment_type": self.apartment_type,
            "capacity": self.capacity,
            "room_count": self.room_count,
            "has_wifi": self.has_wifi,
            "price_per_night": self.price_per_night,
            "is_available": self.is_available,
            "hotel_id": self.hotel_id,
            "created_at": self.created_at.isoformat()
        }