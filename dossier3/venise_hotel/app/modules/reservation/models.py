from app.extensions import db
from datetime import datetime
from sqlalchemy import ForeignKey
from app.modules.hotel.models import EventRoom, Apartment

class ReservationStatus:
    PENDING = 'en attente'
    CONFIRMED = 'confirmée'
    CANCELLED = 'annulée'
    COMPLETED = 'terminée'

class PaymentMethod:
    CASH = 'espèces'
    MOBILE_MONEY = 'mobile money'
    BANK_TRANSFER = 'orange money'
   

class EventType:
    WEDDING = 'mariage'
    BIRTHDAY = 'anniversaire'
    CONFERENCE = 'conférence'
    BAPTISM = 'baptême'
    SEMINAR = 'séminaire'
    PARTY = 'fête'
    OTHER = 'autre'

class RoomReservation(db.Model):
    __tablename__ = 'room_reservations'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    date_arrivee = db.Column(db.Date, nullable=False)
    date_depart = db.Column(db.Date, nullable=False)
    nombre_personnes = db.Column(db.Integer, nullable=False)
    methode_paiement = db.Column(db.String(50), nullable=True)
    statut = db.Column(db.String(20), default=ReservationStatus.CONFIRMED)
    prix_total = db.Column(db.Float, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    # Relation avec back_populates
    room = db.relationship('Room', backref=db.backref('reservations', lazy=True))


    user = db.relationship('User', backref='room_reservations')

    def __repr__(self):
        return f'<RoomReservation {self.id} - {self.nom} {self.prenom}>'

class ApartmentReservation(db.Model):
    __tablename__ = 'apartment_reservations'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    date_arrivee = db.Column(db.Date, nullable=False)
    date_depart = db.Column(db.Date, nullable=False)
    nombre_personnes = db.Column(db.Integer, nullable=False)
    methode_paiement = db.Column(db.String(50), nullable=True)
    statut = db.Column(db.String(20), default=ReservationStatus.CONFIRMED)
    prix_total = db.Column(db.Float, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    apartment_id = db.Column(db.Integer, db.ForeignKey('apartments.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    # Relation avec back_populates
    apartment = db.relationship('Apartment', back_populates='apartment_reservations')
    user = db.relationship('User', backref='apartment_reservations')

    def __repr__(self):
        return f'<ApartmentReservation {self.id} - {self.nom} {self.prenom}>'

class EventRoomReservation(db.Model):
    __tablename__ = 'event_room_reservations'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    type_evenement = db.Column(db.String(50), nullable=False)
    date_evenement = db.Column(db.Date, nullable=False)
    heure_debut = db.Column(db.Time, nullable=False)
    heure_fin = db.Column(db.Time, nullable=False)
    nombre_invites = db.Column(db.Integer, nullable=False)
    methode_paiement = db.Column(db.String(50), nullable=True)
    statut = db.Column(db.String(20), default=ReservationStatus.CONFIRMED)
    prix_total = db.Column(db.Float, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    event_room_id = db.Column(db.Integer, db.ForeignKey('event_rooms.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    # Relation avec back_populates
    event_room = db.relationship('EventRoom', back_populates='event_room_reservations')
    user = db.relationship('User', backref='event_reservations')

    def __repr__(self):
        return f'<EventRoomReservation {self.id} - {self.type_evenement} - {self.date_evenement}>'