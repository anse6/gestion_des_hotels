from flask import Blueprint, request, jsonify
from app import db
from .models import ContactMessage

contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')

@contact_bp.route('/', methods=['POST'])
def submit_contact():
    data = request.get_json()

    required_fields = ['first_name', 'last_name', 'email', 'subject', 'message']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Le champ '{field}' est requis"}), 400

    message = ContactMessage(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        subject=data['subject'],
        message=data['message']
    )

    try:
        db.session.add(message)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Message envoyé avec succès"}), 201
