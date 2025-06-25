# # models.py
# from app.extensions import db, mail
# from flask import current_app
# from flask_mail import Message
# from datetime import datetime
# from sqlalchemy import ForeignKey
# from app.modules.hotel.models import Room, EventRoom, Apartment

# class ReservationStatus:
#     PENDING = 'en attente'
#     CONFIRMED = 'confirmée'
#     CANCELLED = 'annulée'
#     COMPLETED = 'terminée'

# class PaymentMethod:
#     CASH = 'espèces'
#     CARD = 'carte'
#     MOBILE_MONEY = 'mobile money'
#     BANK_TRANSFER = 'virement bancaire'
#     PAYPAL = 'paypal'

# class EventType:
#     WEDDING = 'mariage'
#     BIRTHDAY = 'anniversaire'
#     CONFERENCE = 'conférence'
#     BAPTISM = 'baptême'
#     SEMINAR = 'séminaire'
#     PARTY = 'fête'
#     OTHER = 'autre'

# class RoomReservation(db.Model):
#     __tablename__ = 'room_reservations'

#     id = db.Column(db.Integer, primary_key=True)
#     nom = db.Column(db.String(100), nullable=False)
#     prenom = db.Column(db.String(100), nullable=False)
#     email = db.Column(db.String(100), nullable=False)
#     date_arrivee = db.Column(db.Date, nullable=False)
#     date_depart = db.Column(db.Date, nullable=False)
#     nombre_personnes = db.Column(db.Integer, nullable=False)
#     methode_paiement = db.Column(db.String(50), nullable=True)
#     statut = db.Column(db.String(20), default=ReservationStatus.PENDING)
#     prix_total = db.Column(db.Float, nullable=False)
#     notes = db.Column(db.Text, nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

#     room = db.relationship('Room', backref=db.backref('reservations', lazy=True))
#     user = db.relationship('User', backref=db.backref('room_reservations', lazy=True))

#     def send_notification_email(self):
#         """Envoie un email de notification à l'admin pour une réservation de chambre"""
#         try:
#             msg = Message(
#                 subject="Nouvelle réservation de chambre",
#                 sender="no-reply@votredomaine.com",
#                 recipients=["foufjeanne@votredomaine.com"]
#             )
#             msg.body = f"""
#             Nouvelle réservation de chambre :
            
#             Client: {self.prenom} {self.nom}
#             Email: {self.email}
#             Dates: du {self.date_arrivee} au {self.date_depart}
#             Nombre de personnes: {self.nombre_personnes}
#             Prix total: {self.prix_total} €
#             Statut: {self.statut}
            
#             Détails chambre:
#             - ID: {self.room_id}
#             """
#             mail.send(msg)
#         except Exception as e:
#             current_app.logger.error(f"Erreur lors de l'envoi de l'email: {str(e)}")

# class ApartmentReservation(db.Model):
#     __tablename__ = 'apartment_reservations'

#     id = db.Column(db.Integer, primary_key=True)
#     nom = db.Column(db.String(100), nullable=False)
#     prenom = db.Column(db.String(100), nullable=False)
#     email = db.Column(db.String(100), nullable=False)
#     date_arrivee = db.Column(db.Date, nullable=False)
#     date_depart = db.Column(db.Date, nullable=False)
#     nombre_personnes = db.Column(db.Integer, nullable=False)
#     methode_paiement = db.Column(db.String(50), nullable=True)
#     statut = db.Column(db.String(20), default=ReservationStatus.PENDING)
#     prix_total = db.Column(db.Float, nullable=False)
#     notes = db.Column(db.Text, nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     apartment_id = db.Column(db.Integer, db.ForeignKey('apartments.id'), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

#     apartment = db.relationship('Apartment', backref=db.backref('reservations', lazy=True))
#     user = db.relationship('User', backref=db.backref('apartment_reservations', lazy=True))

#     def send_notification_email(self):
#         """Envoie un email de notification à l'admin pour une réservation d'appartement"""
#         try:
#             msg = Message(
#                 subject="Nouvelle réservation d'appartement",
#                 sender="no-reply@votredomaine.com",
#                 recipients=["foufjeanne@gmail.com"]
#             )
#             msg.body = f"""
#             Nouvelle réservation d'appartement :
            
#             Client: {self.prenom} {self.nom}
#             Email: {self.email}
#             Dates: du {self.date_arrivee} au {self.date_depart}
#             Nombre de personnes: {self.nombre_personnes}
#             Prix total: {self.prix_total} €
#             Statut: {self.statut}
#             """
#             mail.send(msg)
#         except Exception as e:
#             current_app.logger.error(f"Erreur lors de l'envoi de l'email: {str(e)}")

# class EventRoomReservation(db.Model):
#     __tablename__ = 'event_room_reservations'

#     id = db.Column(db.Integer, primary_key=True)
#     nom = db.Column(db.String(100), nullable=False)
#     prenom = db.Column(db.String(100), nullable=False)
#     email = db.Column(db.String(100), nullable=False)
#     type_evenement = db.Column(db.String(50), nullable=False)
#     date_evenement = db.Column(db.Date, nullable=False)
#     heure_debut = db.Column(db.Time, nullable=False)
#     heure_fin = db.Column(db.Time, nullable=False)
#     nombre_invites = db.Column(db.Integer, nullable=False)
#     methode_paiement = db.Column(db.String(50), nullable=True)
#     statut = db.Column(db.String(20), default=ReservationStatus.PENDING)
#     prix_total = db.Column(db.Float, nullable=False)
#     notes = db.Column(db.Text, nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     event_room_id = db.Column(db.Integer, db.ForeignKey('event_rooms.id'), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

#     event_room = db.relationship('EventRoom', backref=db.backref('reservations', lazy=True))
#     user = db.relationship('User', backref=db.backref('event_reservations', lazy=True))

#     def send_notification_email(self):
#         """Envoie un email de notification à l'admin pour une réservation de salle d'événement"""
#         try:
#             msg = Message(
#                 subject="Nouvelle réservation de salle d'événement",
#                 sender="no-reply@votredomaine.com",
#                 recipients=["foufjeanne@votredomaine.com"]
#             )
#             msg.body = f"""
#             Nouvelle réservation de salle d'événement :
            
#             Client: {self.prenom} {self.nom}
#             Email: {self.email}
#             Type d'événement: {self.type_evenement}
#             Date: {self.date_evenement}
#             Heures: de {self.heure_debut} à {self.heure_fin}
#             Nombre d'invités: {self.nombre_invites}
#             Prix total: {self.prix_total} €
#             Statut: {self.statut}
#             """
#             mail.send(msg)
#         except Exception as e:
#             current_app.logger.error(f"Erreur lors de l'envoi de l'email: {str(e)}")