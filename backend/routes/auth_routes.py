
# backend/routes/auth_routes.py

from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_jwt_extended import  create_refresh_token
from models import db, Employee
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)


#=============================
#=========register-superadmin
#=============================




@auth_bp.route('/register-superadmin', methods=['POST'])
def register_superadmin():
    # ❌ Limit to 2 superadmins
    if Employee.query.filter_by(role='superadmin').count() >= 2:
        return jsonify({'error': 'Maximum of 2 Super Admins allowed'}), 403

    data = request.get_json()
    required_fields = ['name', 'username', 'password', 'phone', 'address', 'city']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'error': 'All fields are required'}), 400

    if Employee.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409

    new_superadmin = Employee(
        name=data['name'],
        username=data['username'],
        phone=data['phone'],
        email=data.get('email'),
        address=data['address'],
        city=data['city'],
        role='superadmin',
        is_active=True,
        password=generate_password_hash(data['password']),
        created_by=None
    )

    db.session.add(new_superadmin)
    db.session.commit()

    return jsonify({'message': 'Super Admin registered successfully'}), 201




#===========================
#=========Login
#=======================





#===========================
#=========Login
#=======================





@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = Employee.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is inactive'}), 403

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            'role': user.role,
            'email': user.email
        }
    )

    refresh_token = create_refresh_token(
        identity=str(user.id),
        additional_claims={
            'role': user.role,
            'email': user.email
        }
    )
    user_data = {
    'id': user.id,
    'username': user.username,   
    'email': user.email,
    'role': user.role,
    'name': user.name,
    'city': user.city
}

   

    return jsonify({
        'message': f'Login successful as {user.role}',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user_data
    }), 200