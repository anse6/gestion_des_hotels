from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import db, migrate, jwt, mail
from app.scheduler import init_scheduler  

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)  # Optionnel : autoriser les requêtes cross-origin

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

   
    with app.app_context():
        init_scheduler(app)


    from app.modules.auth.routes import auth_bp
    app.register_blueprint(auth_bp)

    from app.modules.hotel.routes import hotel_bp
    app.register_blueprint(hotel_bp)

    from app.modules.reservation.routes import reservation_bp
    app.register_blueprint(reservation_bp)
    
    from app.modules.personnel.routes import personnel_bp
    app.register_blueprint(personnel_bp)
    from app.modules.contact.routes import contact_bp
    app.register_blueprint(contact_bp)
    
    from app.modules.chatbot.views import chatbot_bp
    app.register_blueprint(chatbot_bp)

    @app.route('/')
    def index():
        return "API Authentication System"

    return app
