import random
import string

# Générer un code de vérification (ex: pour mot de passe oublié)
def generate_verification_code(length=6):
    return ''.join(random.choices(string.digits, k=length))

# Vérifie si l'utilisateur a un rôle donné
def has_role(user, role):
    return user.role == role

# Liste de rôles valides
VALID_ROLES = ['user', 'admin', 'superadmin']