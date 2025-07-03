from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash
from models import db, Employee

superadmin_bp = Blueprint('superadmin', __name__)

# ✅ Fixed 20 predefined areas
PREDEFINED_AREAS = [
    "Shivajinagar", "Kothrud", "Baner", "Hinjewadi", "Wakad",
    "Aundh", "Kharadi", "Viman Nagar", "Hadapsar", "Camp",
    "Kondhwa", "Katraj", "Pimpri", "Chinchwad", "Akurdi",
    "Nigdi", "Ravet", "Pimple Saudagar", "Pimple Gurav", "Thergaon"
]

# ✅ Endpoint to get all predefined areas (used by frontend)
@superadmin_bp.route('/areas', methods=['GET'])
def get_areas():
    return jsonify(PREDEFINED_AREAS)


# ✅ Endpoint to create admin — accessible only to superadmins
@superadmin_bp.route('/superadmin/create-admin', methods=['POST'])
@jwt_required()
def create_admin():
    claims = get_jwt()
    if claims['role'] != 'superadmin':
        return jsonify({'error': 'Only superadmins can create admins'}), 403

    data = request.get_json()
    required_fields = ['name', 'username', 'password', 'phone', 'address', 'city']

    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f"{field} is required"}), 400

    assigned_area = data['city']

    if assigned_area not in PREDEFINED_AREAS:
        return jsonify({'error': f"Invalid area: {assigned_area}. Must be one of 20 predefined areas."}), 400

    if Employee.query.filter_by(role='admin', city=assigned_area).first():
        return jsonify({'error': f"An admin already exists for '{assigned_area}'"}), 409

    if Employee.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409

    hashed_password = generate_password_hash(data['password'])

    new_admin = Employee(
        name=data['name'],
        username=data['username'],
        password=hashed_password,
        phone=data['phone'],
        address=data['address'],
        city=assigned_area,
        role='admin',
        is_active=True,
        created_by=get_jwt_identity()
    )

    db.session.add(new_admin)
    db.session.commit()

    return jsonify({
        'message': "Admin created successfully",
        'admin_username': new_admin.username,
        'assigned_area': new_admin.city
    }), 201
