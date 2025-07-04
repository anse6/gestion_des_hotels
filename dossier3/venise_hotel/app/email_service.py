from flask_mail import Message
from flask import current_app
from app import mail

def send_reminder_email(email, reservation):
    subject = "Rappel : votre réservation arrive bientôt à son terme"

    # Détecter la date de fin selon le type de réservation
    if hasattr(reservation, 'date_depart'):
        date_fin = reservation.date_depart.strftime('%d/%m/%Y')
        type_resa = "chambre/appartement"
    elif hasattr(reservation, 'date_evenement'):
        date_fin = reservation.date_evenement.strftime('%d/%m/%Y')
        type_resa = "salle"
    else:
        date_fin = "inconnue"
        type_resa = "réservation"

    body = f"""
Bonjour {reservation.prenom},

Votre réservation pour la {type_resa} se termine le {date_fin}.

Nous vous remercions de votre confiance et restons à votre disposition.

Cordialement,
L'équipe de l'hôtel
"""

    try:
        msg = Message(subject=subject, recipients=[email], body=body)
        mail.send(msg)
        current_app.logger.info(f"Email de rappel envoyé à {email}")
    except Exception as e:
        current_app.logger.error(f"Erreur envoi email à {email} : {str(e)}")
