# create_superadmin.py (renommé et amélioré)
from app import create_app
from app.modules.auth.models import User
from app.extensions import db
import sys

def create_superadmin(email="superadmin@example.com", password="superadmin123", name="SuperAdmin"):
    app = create_app()
    with app.app_context():
        # Vérifions si la table existe
        try:
            # Vérifions si un superadmin existe déjà
            existing_superadmin = User.query.filter_by(role='superadmin').first()
            if existing_superadmin:
                print(f"Un superadmin existe déjà avec l'email: {existing_superadmin.email}")
                return
                
            # Créer le superadmin
            superadmin = User(
                name=name,
                email=email,
                role="superadmin",
                is_active=True
            )
            superadmin.set_password(password)
            db.session.add(superadmin)
            db.session.commit()
            print(f"SuperAdmin créé avec succès. Email: {email}, Mot de passe: {password}")
        except Exception as e:
            print(f"Erreur lors de la création du superadmin: {str(e)}")
            db.session.rollback()

if __name__ == '__main__':
    # Permettre des paramètres personnalisés en ligne de commande
    email = "superadmin@example.com"
    password = "superadmin123"
    name = "SuperAdmin"
    
    if len(sys.argv) > 1:
        email = sys.argv[1]
    if len(sys.argv) > 2:
        password = sys.argv[2]
    if len(sys.argv) > 3:
        name = sys.argv[3]
        
    create_superadmin(email, password, name)