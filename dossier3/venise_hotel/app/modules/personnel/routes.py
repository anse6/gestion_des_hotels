from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.modules.auth.models import User
from app.modules.hotel.models import Hotel
from .models import Personnel, Attendance, Payment
from app import db
from datetime import datetime, time, timedelta
import qrcode
import io
import uuid
import hashlib

personnel_bp = Blueprint('personnel', __name__, url_prefix='/api/personnel')

# Constantes
DAY_SHIFT_START = time(8, 0)
DAY_SHIFT_END = time(17, 0)
NIGHT_SHIFT_START = time(17, 0)
NIGHT_SHIFT_END = time(8, 0)
LATE_DEDUCTION = 1000
ABSENCE_DEDUCTION = 5000

def generate_qr_code_data(personnel_id):
    """Génère un identifiant unique pour le QR code"""
    unique_id = str(uuid.uuid4())
    return f"PERS-{personnel_id}-{unique_id}"

def generate_device_id(phone_number):
    """Crée un identifiant unique basé sur le numéro de téléphone et un salt"""
    salt = current_app.config['SECRET_KEY']
    return hashlib.sha256(f"{phone_number}{salt}".encode()).hexdigest()

@personnel_bp.route('/', methods=['POST'])
@jwt_required()
def create_personnel():
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    
    # Vérifier que l'utilisateur est admin d'un hôtel
    if current_user.role != 'admin':
        return jsonify({"error": "Accès refusé. Seuls les admins peuvent créer du personnel"}), 403
    
    data = request.get_json()
    
    # Validation des données
    required_fields = ['first_name', 'last_name', 'email', 'address', 'phone', 'salary', 'neighborhood', 'shift_type']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Le champ {field} est obligatoire"}), 400
    
    # Vérifier que le shift_type est valide
    if data['shift_type'] not in ['day', 'night']:
        return jsonify({"error": "Le type de shift doit être 'day' ou 'night'"}), 400
    
    # Récupérer l'hôtel géré par l'admin
    hotel = Hotel.query.filter_by(admin_id=current_user.id).first()
    if not hotel:
        return jsonify({"error": "Vous ne gérez aucun hôtel"}), 400
    
    # Vérifier si l'email ou le téléphone existe déjà
    if Personnel.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Cet email est déjà utilisé"}), 400
    if Personnel.query.filter_by(phone=data['phone']).first():
        return jsonify({"error": "Ce numéro de téléphone est déjà utilisé"}), 400
    
    try:
        # Créer l'employé
        personnel = Personnel(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            address=data['address'],
            phone=data['phone'],
            salary=float(data['salary']),
            neighborhood=data['neighborhood'],
            shift_type=data['shift_type'],
            hotel_id=hotel.id,
            qr_code_id=generate_qr_code_data(hotel.id),
            phone_device_id=generate_device_id(data['phone'])
        )
        
        db.session.add(personnel)
        db.session.commit()
        
        # Générer le QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(personnel.qr_code_id)
        qr.make(fit=True)
        img = qr.make_image(fill='black', back_color='white')
        
        # Sauvegarder le QR code (dans un système de fichiers ou S3)
        img_bytes = io.BytesIO()
        img.save(img_bytes)
        img_bytes.seek(0)
        
        # Ici vous pourriez sauvegarder l'image dans votre système de stockage
        # et sauvegarder l'URL dans la base de données
        
        return jsonify({
            "message": "Personnel créé avec succès",
            "personnel": {
                "id": personnel.id,
                "name": f"{personnel.first_name} {personnel.last_name}",
                "qr_code_id": personnel.qr_code_id,
                # "qr_code_url": "URL_du_qr_code" si sauvegardé
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    # maintenant je fais le get pour afficher les informatios du personnel 
    
@personnel_bp.route('/personnes', methods=['GET'])
@jwt_required()
def get_all_personnel():
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    
    # Vérifier les permissions
    if current_user.role not in ['admin', 'superadmin']:
        return jsonify({"error": "Accès refusé"}), 403
    
    # Pour les admins, ne retourner que le personnel de leur hôtel
    if current_user.role == 'admin':
        hotel = Hotel.query.filter_by(admin_id=current_user.id).first()
        if not hotel:
            return jsonify({"error": "Vous ne gérez aucun hôtel"}), 400
        
        personnels = Personnel.query.filter_by(hotel_id=hotel.id).all()
    else:  # superadmin - tous les hôtels
        personnels = Personnel.query.all()
    
    # Formater la réponse
    personnel_list = []
    for p in personnels:
        personnel_list.append({
            "id": p.id,
            "first_name": p.first_name,
            "last_name": p.last_name,
            "email": p.email,
            "phone": p.phone,
            "address": p.address,
            "salary": p.salary,
            "neighborhood": p.neighborhood,
            "shift_type": p.shift_type,
            "is_active": p.is_active,
            "qr_code_id": p.qr_code_id,
            "phone_device_id": p.phone_device_id,
            "hotel_id": p.hotel_id,
            "created_at": p.created_at.isoformat() if p.created_at else None
        })
    
    return jsonify(personnel_list)

@personnel_bp.route('/<int:personnel_id>', methods=['GET'])
@jwt_required()
def get_personnel(personnel_id):
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    
    personnel = Personnel.query.get_or_404(personnel_id)
    hotel = Hotel.query.get(personnel.hotel_id)
    
    # Vérifier les permissions
    if current_user.role == 'admin' and hotel.admin_id != current_user.id:
        return jsonify({"error": "Accès refusé"}), 403
    
    return jsonify({
        "id": personnel.id,
        "first_name": personnel.first_name,
        "last_name": personnel.last_name,
        "email": personnel.email,
        "phone": personnel.phone,
        "address": personnel.address,
        "salary": personnel.salary,
        "neighborhood": personnel.neighborhood,
        "shift_type": personnel.shift_type,
        "is_active": personnel.is_active,
        "qr_code_id": personnel.qr_code_id,
        "phone_device_id": personnel.phone_device_id,
        "hotel_id": personnel.hotel_id,
        "created_at": personnel.created_at.isoformat() if personnel.created_at else None
    })

@personnel_bp.route('/device/<string:device_id>', methods=['GET'])
@jwt_required()
def get_personnel_by_device(device_id):
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    
    personnel = Personnel.query.filter_by(phone_device_id=device_id).first()
    if not personnel:
        return jsonify({"error": "Aucun personnel trouvé avec ce device ID"}), 404
    
    hotel = Hotel.query.get(personnel.hotel_id)
    
    # Vérifier les permissions
    if current_user.role == 'admin' and hotel.admin_id != current_user.id:
        return jsonify({"error": "Accès refusé"}), 403
    
    return jsonify({
        "id": personnel.id,
        "first_name": personnel.first_name,
        "last_name": personnel.last_name,
        "email": personnel.email,
        "phone": personnel.phone,
        "qr_code_id": personnel.qr_code_id,
        "hotel_id": personnel.hotel_id,
        "shift_type": personnel.shift_type
    })   
    
    
    
    

@personnel_bp.route('/check-in', methods=['POST'])
def check_in():
    data = request.get_json()
    
    if not data.get('qr_code_id') or not data.get('device_id'):
        return jsonify({"error": "QR code ID et device ID sont requis"}), 400
    
    # Trouver l'employé
    personnel = Personnel.query.filter_by(qr_code_id=data['qr_code_id']).first()
    if not personnel:
        return jsonify({"error": "Employé non trouvé"}), 404
    
    # Vérifier que le device ID correspond
    if personnel.phone_device_id != data['device_id']:
        return jsonify({"error": "Authentification du dispositif échouée"}), 401
    
    # Vérifier s'il a déjà pointé aujourd'hui
    today = datetime.utcnow().date()
    existing_attendance = Attendance.query.filter_by(
        personnel_id=personnel.id,
        date=today
    ).first()
    
    if existing_attendance and existing_attendance.arrival_time:
        return jsonify({"error": "Vous avez déjà pointé aujourd'hui"}), 400
    
    now = datetime.utcnow()
    current_time = now.time()
    status = 'present'
    deduction = 0.0
    
    # Vérifier les retards
    if personnel.shift_type == 'day':
        if current_time > DAY_SHIFT_START:
            late_minutes = (datetime.combine(today, current_time) - datetime.combine(today, DAY_SHIFT_START))
            if late_minutes.total_seconds() > 900:  # 15 minutes de tolérance
                status = 'late'
                deduction = LATE_DEDUCTION
    else:  # night shift
        if current_time > NIGHT_SHIFT_START:
            late_minutes = (datetime.combine(today, current_time) - datetime.combine(today, NIGHT_SHIFT_START))
            if late_minutes.total_seconds() > 900:  # 15 minutes de tolérance
                status = 'late'
                deduction = LATE_DEDUCTION
    
    # Créer ou mettre à jour le pointage
    if existing_attendance:
        existing_attendance.arrival_time = now
        existing_attendance.status = status
        existing_attendance.deduction = deduction
    else:
        attendance = Attendance(
            personnel_id=personnel.id,
            date=today,
            arrival_time=now,
            status=status,
            deduction=deduction
        )
        db.session.add(attendance)
    
    db.session.commit()
    
    return jsonify({
        "message": "Pointage enregistré",
        "status": status,
        "deduction": deduction
    })

@personnel_bp.route('/check-out', methods=['POST'])
def check_out():
    data = request.get_json()
    
    if not data.get('qr_code_id') or not data.get('device_id'):
        return jsonify({"error": "QR code ID et device ID sont requis"}), 400
    
    # Trouver l'employé
    personnel = Personnel.query.filter_by(qr_code_id=data['qr_code_id']).first()
    if not personnel:
        return jsonify({"error": "Employé non trouvé"}), 404
    
    # Vérifier que le device ID correspond
    if personnel.phone_device_id != data['device_id']:
        return jsonify({"error": "Authentification du dispositif échouée"}), 401
    
    today = datetime.utcnow().date()
    attendance = Attendance.query.filter_by(
        personnel_id=personnel.id,
        date=today
    ).first()
    
    if not attendance:
        return jsonify({"error": "Vous n'avez pas pointé ce matin"}), 400
    
    if attendance.departure_time:
        return jsonify({"error": "Vous avez déjà pointé votre départ"}), 400
    
    now = datetime.utcnow()
    current_time = now.time()
    
    # Vérifier les départs anticipés
    if personnel.shift_type == 'day':
        if current_time < DAY_SHIFT_END:
            early_minutes = (datetime.combine(today, DAY_SHIFT_END) - datetime.combine(today, current_time))
            if early_minutes.total_seconds() > 900:  # 15 minutes de tolérance
                if attendance.status == 'late':
                    attendance.deduction += LATE_DEDUCTION
                else:
                    attendance.status = 'left_early'
                    attendance.deduction = LATE_DEDUCTION
    else:  # night shift
        if current_time < NIGHT_SHIFT_END and current_time > time(0, 0):
            early_minutes = (datetime.combine(today, NIGHT_SHIFT_END) - datetime.combine(today, current_time))
            if early_minutes.total_seconds() > 900:  # 15 minutes de tolérance
                if attendance.status == 'late':
                    attendance.deduction += LATE_DEDUCTION
                else:
                    attendance.status = 'left_early'
                    attendance.deduction = LATE_DEDUCTION
    
    attendance.departure_time = now
    db.session.commit()
    
    return jsonify({
        "message": "Départ enregistré",
        "status": attendance.status,
        "deduction": attendance.deduction
    })

@personnel_bp.route('/justify', methods=['POST'])
@jwt_required()
def justify_absence():
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    
    data = request.get_json()
    
    if not data.get('personnel_id') or not data.get('date') or not data.get('reason'):
        return jsonify({"error": "ID employé, date et raison sont requis"}), 400
    
    # Vérifier que l'utilisateur est admin de l'hôtel de l'employé
    personnel = Personnel.query.get(data['personnel_id'])
    if not personnel:
        return jsonify({"error": "Employé non trouvé"}), 404
    
    hotel = Hotel.query.get(personnel.hotel_id)
    if current_user.id != hotel.admin_id and current_user.role != 'superadmin':
        return jsonify({"error": "Accès refusé"}), 403
    
    try:
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Format de date invalide. Utilisez YYYY-MM-DD"}), 400
    
    # Créer ou mettre à jour le pointage
    attendance = Attendance.query.filter_by(
        personnel_id=personnel.id,
        date=date
    ).first()
    
    if attendance:
        attendance.status = 'justified'
        attendance.justification = data['reason']
        attendance.deduction = 0.0
    else:
        attendance = Attendance(
            personnel_id=personnel.id,
            date=date,
            status='justified',
            justification=data['reason'],
            deduction=0.0
        )
        db.session.add(attendance)
    
    db.session.commit()
    
    return jsonify({"message": "Absence justifiée avec succès"})

@personnel_bp.route('/generate-payments', methods=['POST'])
@jwt_required()
def generate_payments():
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    
    if current_user.role not in ['admin', 'superadmin']:
        return jsonify({"error": "Accès refusé"}), 403
    
    data = request.get_json()
    month = data.get('month', datetime.utcnow().month)
    year = data.get('year', datetime.utcnow().year)
    
    # Pour les admins, ne générer que pour leur hôtel
    if current_user.role == 'admin':
        hotel = Hotel.query.filter_by(admin_id=current_user.id).first()
        if not hotel:
            return jsonify({"error": "Vous ne gérez aucun hôtel"}), 400
        
        personnels = Personnel.query.filter_by(hotel_id=hotel.id).all()
    else:  # superadmin - tous les hôtels
        personnels = Personnel.query.all()
    
    # Vérifier si les paiements ont déjà été générés
    existing_payments = Payment.query.filter_by(month=month, year=year).count()
    if existing_payments > 0:
        return jsonify({"error": "Les paiements pour cette période ont déjà été générés"}), 400
    
    try:
        for personnel in personnels:
            # Calculer les déductions du mois
            attendances = Attendance.query.filter(
                db.extract('month', Attendance.date) == month,
                db.extract('year', Attendance.date) == year,
                Attendance.personnel_id == personnel.id
            ).all()
            
            total_deductions = sum(a.deduction for a in attendances)
            
            # Créer le paiement
            payment = Payment(
                personnel_id=personnel.id,
                month=month,
                year=year,
                base_salary=personnel.salary,
                total_deductions=total_deductions,
                net_salary=personnel.salary - total_deductions,
                status='pending'
            )
            db.session.add(payment)
        
        db.session.commit()
        return jsonify({"message": f"Paiements générés pour {month}/{year}", "count": len(personnels)})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@personnel_bp.route('/payments/<int:payment_id>', methods=['PUT'])
@jwt_required()
def mark_payment_paid(payment_id):
    current_user = User.query.filter_by(email=get_jwt_identity()).first()
    
    payment = Payment.query.get_or_404(payment_id)
    personnel = Personnel.query.get(payment.personnel_id)
    hotel = Hotel.query.get(personnel.hotel_id)
    
    # Vérifier les permissions
    if current_user.role == 'admin' and hotel.admin_id != current_user.id:
        return jsonify({"error": "Accès refusé"}), 403
    
    if payment.status == 'paid':
        return jsonify({"error": "Paiement déjà effectué"}), 400
    
    payment.status = 'paid'
    payment.payment_date = datetime.utcnow()
    db.session.commit()
    
    return jsonify({"message": "Paiement marqué comme effectué"})