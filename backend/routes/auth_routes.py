
# backend/routes/auth_routes.py

from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_jwt_extended import  create_refresh_token
from token_blacklist import blacklist
from models import db, Employee,City
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)


#=============================
#=========register-superadmin
#=============================




@auth_bp.route('/register-superadmin', methods=['POST'])
def register_superadmin():
    # ✅ Limit to 2 superadmins
    if Employee.query.filter_by(role='superadmin').count() >= 2:
        return jsonify({'error': 'Maximum of 2 Super Admins allowed'}), 403

    data = request.get_json()

    # ✅ Required fields including city_id
    required_fields = ['name', 'username', 'email', 'password', 'phone', 'address', 'city_id']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'error': 'All fields are required'}), 400

    # ✅ Check if username or email already exists
    if Employee.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    if Employee.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409

    # ✅ Validate city_id exists
    city_id = data['city_id']
    if not City.query.get(city_id):
        return jsonify({'error': 'Invalid city ID'}), 400

    # ✅ Create new superadmin
    new_superadmin = Employee(
        name=data['name'],
        username=data['username'],
        email=data['email'],
        phone=data['phone'],
        address=data['address'],
        role='superadmin',
        is_active=True,
        password=generate_password_hash(data['password']),
        created_by=None,
        city_id=city_id
    )

    db.session.add(new_superadmin)
    db.session.commit()

    return jsonify({'message': 'Super Admin registered successfully'}), 201




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
    'city': user.city.name if user.city else None
     }


   

    return jsonify({
        'message': f'Login successful as {user.role}',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user_data
    }), 200


#===========================
#=========Logout
#=======================


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    print("🔓 Logout route hit")
    jti = get_jwt()['jti']           # Unique token identifier
    role = get_jwt().get('role', 'Unknown')         
    email = get_jwt().get('email', 'Unknown')

    # Add the token to the blacklist
    blacklist.add(jti)

    return jsonify({
        'message': f"{role.title()} '{email}' has been logged out successfully.",
        'revoked': True
    }), 200
