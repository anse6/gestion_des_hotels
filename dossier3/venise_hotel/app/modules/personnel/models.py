from app.extensions import db
from datetime import datetime, time
from flask_login import UserMixin

class Personnel(db.Model, UserMixin):
    __tablename__ = 'personnel'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    address = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    salary = db.Column(db.Float, nullable=False)
    neighborhood = db.Column(db.String(100), nullable=False)
    qr_code_id = db.Column(db.String(50), unique=True, nullable=False)
    phone_device_id = db.Column(db.String(100), unique=True, nullable=False)  # Identifiant unique du téléphone
    shift_type = db.Column(db.String(10), nullable=False)  # 'day' ou 'night'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'), nullable=False)
    hotel = db.relationship('Hotel', backref='employees')
    
 
    attendances = db.relationship('Attendance', backref='employee', cascade='all, delete-orphan')
    

    payments = db.relationship('Payment', backref='employee', cascade='all, delete-orphan')

class Attendance(db.Model):
    __tablename__ = 'attendances'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    arrival_time = db.Column(db.DateTime)
    departure_time = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='present')  # present, absent, late, left_early
    justification = db.Column(db.Text)
    deduction = db.Column(db.Float, default=0.0)
    

    personnel_id = db.Column(db.Integer, db.ForeignKey('personnel.id'), nullable=False)

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    base_salary = db.Column(db.Float, nullable=False)
    total_deductions = db.Column(db.Float, default=0.0)
    net_salary = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')  # pending, paid
    personnel_id = db.Column(db.Integer, db.ForeignKey('personnel.id'), nullable=False)