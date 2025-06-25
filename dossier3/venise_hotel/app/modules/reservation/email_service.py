from flask_mail import Message
from flask import current_app
from app.extensions import mail

def send_reservation_notification(reservation, reservation_type):
    """Envoie la notification à l'admin avec le lien de confirmation"""
    try:
        # Générer le lien de confirmation
        confirm_url = f"/api/reservations/confirm/{reservation_type}/{reservation.id}"
        
        # Identifier le numéro de chambre/appartement/salle
        resource_id = getattr(reservation, f"{reservation_type}_id", "N/A")
        
        msg = Message(
            subject=f"Réservation {reservation_type} #{reservation.id} - Confirmation requise",
            recipients=['ansevernel@gmail.com']  # Email admin fixe
        )
        
        msg.body = f"""
        Nouvelle réservation {reservation_type.upper()}
        
        Détails:
        - Numéro: {resource_id}
        - Client: {reservation.prenom} {reservation.nom}
        - Email: {reservation.email}
        - Dates: {reservation.date_arrivee} au {reservation.date_depart}
        - Prix: {reservation.prix_total}
        
        Pour confirmer, cliquez sur ce lien:
        {confirm_url}
        """
        
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Erreur envoi notification admin: {str(e)}")
        return False

def send_client_confirmation(reservation, reservation_type):
    """Envoie la confirmation au client"""
    try:
        # Identifier le numéro de chambre/appartement/salle
        resource_id = getattr(reservation, f"{reservation_type}_id", "N/A")
        
        msg = Message(
            subject=f"Confirmation réservation {reservation_type} #{reservation.id}",
            recipients=[reservation.email]
        )
        
        msg.body = f"""
        Bonjour {reservation.prenom},
        
        Votre réservation {reservation_type} #{reservation.id} a été confirmée.
        
        Détails:
        - Numéro: {resource_id}
        - Dates: {reservation.date_arrivee} au {reservation.date_depart}
        - Prix total: {reservation.prix_total}
        
        Merci pour votre confiance!
        """
        
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Erreur envoi confirmation client: {str(e)}")
        return False