from flask_cors import CORS
from app import create_app
import logging

app = create_app()

# ✅ Configuration CORS plus permissive pour le développement
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# ✅ Configuration du logging
if not app.logger.handlers:
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter('[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)

app.logger.setLevel(logging.INFO)
app.logger.info("Application Flask démarrée...")

# ✅ Lancement de l'application
if __name__ == '__main__':
    app.run(debug=True, port=5000)
