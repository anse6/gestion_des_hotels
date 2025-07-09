import secrets
import random
import string
from flask_mail import Message
from app.extensions import mail

def generate_reset_token():
    """Génère un token sécurisé pour la réinitialisation de mot de passe"""
    return secrets.token_urlsafe(32)

def generate_verification_code(length=6):
    """Génère un code de vérification numérique"""
    return ''.join(random.choices(string.digits, k=length))

def has_role(user, role):
    """Vérifie si l'utilisateur a un rôle donné"""
    return user.role == role

# Liste de rôles valides
VALID_ROLES = ['user', 'admin', 'superadmin']

def send_password_reset_email(email, token):
    """Envoie un email de réinitialisation de mot de passe avec template professionnel"""
    reset_url = f"http://localhost:5173/resst-password?token={token}"
    
    msg = Message(
        subject="Réinitialisation de votre mot de passe",
        recipients=[email],
        sender="noreply@yourapp.com"
    )
    
    msg.html = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                                    🔐 Réinitialisation de mot de passe
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
                                    Bonjour,
                                </h2>
                                
                                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. 
                                    Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
                                </p>
                                
                                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                    Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous :
                                </p>
                                
                                <!-- Button -->
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td align="center">
                                            <a href="{reset_url}" 
                                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                                      color: #ffffff; 
                                                      text-decoration: none; 
                                                      padding: 15px 35px; 
                                                      border-radius: 6px; 
                                                      font-weight: 600; 
                                                      font-size: 16px; 
                                                      display: inline-block; 
                                                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                                                Réinitialiser mon mot de passe
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                                    Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                                    <a href="{reset_url}" style="color: #667eea; word-break: break-all;">{reset_url}</a>
                                </p>
                                
                                <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                                    Ce lien expirera dans 24 heures pour des raisons de sécurité.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
                                <p style="color: #999999; font-size: 14px; margin: 0;">
                                    © 2024 Votre Application. Tous droits réservés.<br>
                                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    mail.send(msg)

def send_admin_credentials_email(email, password):
    """Envoie les identifiants d'admin avec template professionnel"""
    login_url = "http://localhost:5173/login"
    
    msg = Message(
        subject="Création de votre compte administrateur",
        recipients=[email],
        sender="noreply@yourapp.com"
    )
    
    msg.html = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Création de compte administrateur</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                                    🎉 Bienvenue, Administrateur !
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
                                    Félicitations !
                                </h2>
                                
                                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Votre compte administrateur a été créé avec succès. Vous pouvez maintenant 
                                    accéder à votre tableau de bord administrateur.
                                </p>
                                
                                <!-- Credentials Box -->
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; margin: 30px 0;">
                                    <tr>
                                        <td style="padding: 25px;">
                                            <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">
                                                🔑 Vos identifiants de connexion
                                            </h3>
                                            
                                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: 600;">
                                                        Email :
                                                    </td>
                                                    <td style="padding: 8px 0; color: #333333; font-size: 14px; font-family: monospace;">
                                                        {email}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: 600;">
                                                        Mot de passe :
                                                    </td>
                                                    <td style="padding: 8px 0; color: #333333; font-size: 14px; font-family: monospace;">
                                                        {password}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Button -->
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td align="center">
                                            <a href="{login_url}" 
                                               style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                                                      color: #ffffff; 
                                                      text-decoration: none; 
                                                      padding: 15px 35px; 
                                                      border-radius: 6px; 
                                                      font-weight: 600; 
                                                      font-size: 16px; 
                                                      display: inline-block; 
                                                      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
                                                Se connecter maintenant
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin: 30px 0;">
                                    <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">
                                        ⚠️ Consignes de sécurité importantes
                                    </h4>
                                    <ul style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px;">
                                        <li>Changez votre mot de passe lors de votre première connexion</li>
                                        <li>Utilisez un mot de passe fort et unique</li>
                                        <li>Ne partagez jamais vos identifiants</li>
                                        <li>Déconnectez-vous après chaque session</li>
                                    </ul>
                                </div>
                                
                                <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                                    Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                                    <a href="{login_url}" style="color: #28a745; word-break: break-all;">{login_url}</a>
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
                                <p style="color: #999999; font-size: 14px; margin: 0;">
                                    © 2024 Votre Application. Tous droits réservés.<br>
                                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    mail.send(msg)

def send_user_credentials_email(email, password):
    """Envoie les identifiants d'utilisateur avec template professionnel"""
    login_url = "http://localhost:5173/login"
    
    msg = Message(
        subject="Création de votre compte utilisateur",
        recipients=[email],
        sender="noreply@yourapp.com"
    )
    
    msg.html = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Création de compte utilisateur</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #007bff 0%, #6610f2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                                    🎉 Bienvenue sur notre plateforme !
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
                                    Votre compte est prêt !
                                </h2>
                                
                                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Votre compte utilisateur a été créé avec succès. Vous pouvez maintenant 
                                    accéder à votre espace personnel et profiter de tous nos services.
                                </p>
                                
                                <!-- Credentials Box -->
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; margin: 30px 0;">
                                    <tr>
                                        <td style="padding: 25px;">
                                            <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">
                                                🔑 Vos identifiants de connexion
                                            </h3>
                                            
                                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: 600;">
                                                        Email :
                                                    </td>
                                                    <td style="padding: 8px 0; color: #333333; font-size: 14px; font-family: monospace;">
                                                        {email}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0; color: #666666; font-size: 14px; font-weight: 600;">
                                                        Mot de passe :
                                                    </td>
                                                    <td style="padding: 8px 0; color: #333333; font-size: 14px; font-family: monospace;">
                                                        {password}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Button -->
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td align="center">
                                            <a href="{login_url}" 
                                               style="background: linear-gradient(135deg, #007bff 0%, #6610f2 100%); 
                                                      color: #ffffff; 
                                                      text-decoration: none; 
                                                      padding: 15px 35px; 
                                                      border-radius: 6px; 
                                                      font-weight: 600; 
                                                      font-size: 16px; 
                                                      display: inline-block; 
                                                      box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);">
                                                Accéder à mon compte
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <div style="background-color: #d1ecf1; border: 1px solid #b8daff; border-radius: 6px; padding: 20px; margin: 30px 0;">
                                    <h4 style="color: #0c5460; margin: 0 0 10px 0; font-size: 16px;">
                                        💡 Conseils pour commencer
                                    </h4>
                                    <ul style="color: #0c5460; font-size: 14px; margin: 0; padding-left: 20px;">
                                        <li>Complétez votre profil pour une meilleure expérience</li>
                                        <li>Changez votre mot de passe si vous le souhaitez</li>
                                        <li>Explorez les différentes fonctionnalités disponibles</li>
                                        <li>Consultez notre aide en ligne si vous avez des questions</li>
                                    </ul>
                                </div>
                                
                                <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                                    Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                                    <a href="{login_url}" style="color: #007bff; word-break: break-all;">{login_url}</a>
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
                                <p style="color: #999999; font-size: 14px; margin: 0;">
                                    © 2024 Votre Application. Tous droits réservés.<br>
                                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    mail.send(msg)