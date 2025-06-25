import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-super-secret")
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost/hoteles'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'ansetech7@gmail.com'
    MAIL_PASSWORD = 'xieq rzgq cjze spdn'
    MAIL_DEFAULT_SENDER = 'ansetech7@gmail.com'
    APP_BASE_URL = 'http://localhost:5000'  