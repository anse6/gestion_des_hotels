import secrets
from flask_mail import Message
from app.extensions import mail

def generate_code():
    return secrets.token_hex(3)

def send_verification_email(email, code):
    msg = Message("Code de réinitialisation", recipients=[email])
    msg.html = f"<p>Votre code est : <strong>{code}</strong></p>"
    mail.send(msg)

def send_admin_credentials_email(email, password):
    msg = Message("Vos identifiants administrateur", recipients=[email])
    msg.html = f"""
    <p>Bonjour,</p>
    <p>Votre compte administrateur a été créé.</p>
    <p>Vos identifiants de connexion:</p>
    <p>Email: <strong>{email}</strong></p>
    <p>Mot de passe: <strong>{password}</strong></p>
    <p>Veuillez changer votre mot de passe après votre première connexion.</p>
    <p>Merci.</p>
    """
    mail.send(msg)