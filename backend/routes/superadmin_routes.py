from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash
from sqlalchemy import or_
from models import db, Employee, Location, City
from datetime import datetime, timezone, timedelta
import pytz 

superadmin_bp = Blueprint('superadmin', __name__)

#--=-=-=-===================
#======List of Cities 
#================================
@superadmin_bp.route('/areas', methods=['GET'])
def get_areas():
    cities = City.query.order_by(City.name).all()
    city_list = [{"id": city.id, "name": city.name} for city in cities]
    return jsonify(city_list)




#--=-=-=-===================
#======Adding new cities ======
#================================


@superadmin_bp.route('/superadmin/add-city', methods=['POST'])
@jwt_required()
def add_city():
    claims = get_jwt()
    
    # ✅ Only superadmin can access this route
    if claims.get('role') != 'superadmin':
        return jsonify({'error': 'Only superadmins can add cities'}), 403

    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': "'name' is required"}), 400

    city_name = data['name'].strip()

    # ✅ Check if city already exists
    if City.query.filter_by(name=city_name).first():
        return jsonify({'error': f"City '{city_name}' already exists"}), 409

    # ✅ Create and insert new city
    new_city = City(name=city_name)
    db.session.add(new_city)
    db.session.commit()

    return jsonify({
        'message': f"City '{city_name}' added successfully",
        'city_id': new_city.id
    }), 201


# --------------------------
# ✅ Create Admin (Only Superadmin)
# --------------------------

@superadmin_bp.route('/superadmin/create-admin', methods=['POST'])
@jwt_required()
def create_admin():
    claims = get_jwt()
    
    # ✅ Ensure only superadmins can access
    if claims.get('role') != 'superadmin':
        return jsonify({'error': 'Only superadmins can create admins'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid or missing JSON body'}), 400

    # ✅ Validate required fields
    required_fields = ['name', 'username', 'password', 'phone', 'address', 'city']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f"'{field}' is required"}), 400

    city_name = data['city'].strip()
    city = City.query.filter_by(name=city_name).first()
    if not city:
        return jsonify({'error': f"Invalid city name: '{city_name}'"}), 400

    # ✅ Ensure no existing admin for the same city
    if Employee.query.filter_by(role='admin', city_id=city.id).first():
        return jsonify({'error': f"An admin already exists for '{city_name}'"}), 409

    # ✅ Check for duplicate username
    if Employee.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409

    # ✅ Check for duplicate email (if provided)
    email = data.get('email')
    if email and Employee.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    # ✅ Hash password
    hashed_password = generate_password_hash(data['password'])

    # ✅ Create new admin
    new_admin = Employee(
        name=data['name'],
        username=data['username'],
        password=hashed_password,
        phone=data['phone'],
        address=data['address'],
        city_id=city.id,
        email=email,
        role='admin',
        is_active=True,
        created_by=get_jwt_identity()
    )

    db.session.add(new_admin)
    db.session.commit()

    return jsonify({
        'message': 'Admin created successfully',
        'admin_username': new_admin.username,
        'assigned_city': city.name
    }), 201



# --------------------------
# ✅ Get All Admins
# --------------------------
@superadmin_bp.route('/superadmin/admins', methods=['GET'])
@jwt_required()
def get_all_admins():
    claims = get_jwt()
    if claims['role'] != 'superadmin':
        return jsonify({'error': 'Unauthorized'}), 403

    admins = Employee.query.filter_by(role='admin').all()

    return jsonify([
        {
            'id': a.id,
            'name': a.name,
            'username': a.username,
            'email' : a.email,
            'phone': a.phone,
            'city': a.city.name if a.city else None,
            'address': a.address,
            'is_active': a.is_active
        } for a in admins
    ]), 200




# --------------------------
# ✅ Update or Delete Admin
# --------------------------


@superadmin_bp.route('/superadmin/admin/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_or_delete_admin(id):
    claims = get_jwt()
    if claims['role'] != 'superadmin':
        return jsonify({'error': 'Unauthorized'}), 403

    admin = Employee.query.get_or_404(id)
    if admin.role != 'admin':
        return jsonify({'error': 'Only admins can be managed here'}), 400

    if request.method == 'PUT':
        data = request.get_json()

        admin.name = data.get('name', admin.name)
        admin.phone = data.get('phone', admin.phone)
        admin.address = data.get('address', admin.address)

        # ✅ Optional: Update city if provided
        city_id = data.get('city_id')
        if city_id:
            city = City.query.get(city_id)
            if not city:
                return jsonify({'error': 'City not found'}), 404
            admin.city = city

        # ✅ Optional: Update password if provided
        new_password = data.get('password')
        if new_password:
            admin.password = generate_password_hash(new_password)

        db.session.commit()
        return jsonify({'message': 'Admin updated successfully'}), 200

    elif request.method == 'DELETE':
        db.session.delete(admin)
        db.session.commit()
        return jsonify({'message': 'Admin deleted successfully'}), 200

# --------------------------
# toggle_admin_status by super admin 
# --------------------------

@superadmin_bp.route('/admin/admin/<int:id>/toggle-status', methods=['PUT'])
@jwt_required()
def toggle_admin_status(id):
    claims = get_jwt()
    
    if claims['role'] != 'superadmin':
        return jsonify({'error': 'Only super admin can perform this action'}), 403

    admin = Employee.query.get_or_404(id)

    if admin.role != 'admin':
        return jsonify({'error': 'Target user is not an admin'}), 400

    admin.is_active = not admin.is_active
    db.session.commit()

    return jsonify({'message': f"Admin {'activated' if admin.is_active else 'deactivated'} successfully."})

# --------------------------
# ✅ Search Admin & Get All Their Workers
# --------------------------
@superadmin_bp.route('/superadmin/admin-workers', methods=['GET'])
@jwt_required()
def get_admin_workers():
    try:
        query_param = request.args.get('search')
        if not query_param:
            return jsonify({'error': 'Missing search parameter'}), 400

        admin = Employee.query.filter(
            Employee.role == 'admin',
            or_(
                Employee.username.ilike(f"%{query_param}%"),
                Employee.name.ilike(f"%{query_param}%")
            )
        ).first()

        if not admin:
            return jsonify({'error': 'Admin not found'}), 404

        workers = Employee.query.filter_by(role='worker', created_by=admin.id).all()

        return jsonify({
            'admin': {
                'id': admin.id,
                'name': admin.name,
                'username': admin.username,
                'phone': admin.phone,
                'city': admin.city.name if admin.city else None,
                'is_active': admin.is_active
            },
            'workers': [
                {
                    'id': w.id,
                    'name': w.name,
                    'username': w.username,
                    'phone': w.phone,
                    'city': w.city.name if w.city else None,
                    'is_active': w.is_active
                } for w in workers
            ]
        }), 200

    except Exception as e:
        print("❌ Internal Server Error:", str(e))
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500




#======================================================
# ================================   WORKER  =========
#======================================================

# --------------------------
# ✅ Get All Workers
# --------------------------
@superadmin_bp.route('/superadmin/workers', methods=['GET'])
@jwt_required()
def get_all_workers():
    claims = get_jwt()
    if claims['role'] != 'superadmin':
        return jsonify({'error': 'Unauthorized'}), 403

    workers = Employee.query.filter_by(role='worker').all()

    return jsonify([
        {
            'id': w.id,
            'name': w.name,
            'email': w.email,
            'phone': w.phone,
            'city': w.city.name if w.city else None,
            'address': w.address,
            'is_active': w.is_active
        } for w in workers
    ]), 200



# -------------------------------
# ✅ Update worker by Super admin admin 
# -------------------------------


# backend/routes/superadmin_routes.py

@superadmin_bp.route('/superadmin/worker/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_or_delete_worker(id):
    claims = get_jwt()
    if claims['role'] != 'superadmin':
        return jsonify({'error': 'Unauthorized'}), 403

    worker = Employee.query.get_or_404(id)
    if worker.role != 'worker':
        return jsonify({'error': 'Only workers can be managed here'}), 400

    if request.method == 'PUT':
        data = request.get_json()

        worker.name = data.get('name', worker.name)
        worker.phone = data.get('phone', worker.phone)
        worker.address = data.get('address', worker.address)

        # ✅ Update city if city_id is provided
        city_id = data.get('city_id')
        if city_id:
            city = City.query.get(city_id)
            if not city:
                return jsonify({'error': 'City not found'}), 404
            worker.city = city

        # ✅ Update password if provided
        new_password = data.get('password')
        if new_password:
            worker.password = generate_password_hash(new_password)

        db.session.commit()
        return jsonify({'message': 'Worker updated successfully'}), 200

    elif request.method == 'DELETE':
        db.session.delete(worker)
        db.session.commit()
        return jsonify({'message': 'Worker deleted successfully'}), 200

# -------------------------------------------
# ✅ Worker toggle for active & Inactive by super admin
# -------------------------------------------

@superadmin_bp.route('/admin/worker/<int:id>/toggle-status', methods=['PUT'])
@jwt_required()
def toggle_worker_status(id):
    claims = get_jwt()
    
    if claims['role'] != 'superadmin':
        return jsonify({'error': 'Only super admin can perform this action'}), 403

    worker = Employee.query.get_or_404(id)

    if worker.role != 'worker':
        return jsonify({'error': 'Target user is not a worker'}), 400

    worker.is_active = not worker.is_active
    db.session.commit()

    return jsonify({'message': f"Worker {'activated' if worker.is_active else 'deactivated'} successfully."})

# -------------------------------
# ✅  Get Worker Live locaton
# -------------------------------


@superadmin_bp.route('/superadmin/worker-location', methods=['GET'])
@jwt_required()
def get_specific_worker_location():
    claims = get_jwt()
    role = claims.get('role')

    if role != 'superadmin':
        return jsonify({'error': 'Unauthorized'}), 403

    worker_id = request.args.get('worker_id')
    if not worker_id:
        return jsonify({'error': 'worker_id is required'}), 400

    try:
        worker_id_int = int(worker_id)
    except ValueError:
        return jsonify({'error': 'worker_id must be an integer'}), 400

    worker = Employee.query.get(worker_id_int)
    if not worker or worker.role != 'worker':
        return jsonify({'error': 'Invalid worker'}), 404

    latest_location = (
        Location.query
        .filter_by(worker_id=worker_id_int)
        .order_by(Location.timestamp.desc())
        .first()
    )

    if not latest_location:
        return jsonify({'error': 'No location found'}), 404

    # Force timestamp to UTC if naive
    utc_time = latest_location.timestamp
    if utc_time.tzinfo is None:
        utc_time = utc_time.replace(tzinfo=timezone.utc)

    # Convert to IST using pytz
    ist_timezone = pytz.timezone("Asia/Kolkata")
    ist_time = utc_time.astimezone(ist_timezone)
    formatted_ist = ist_time.strftime("%a, %d %b %Y %H:%M:%S IST")

    return jsonify({
        'name': worker.name,
        'latitude': latest_location.latitude,
        'longitude': latest_location.longitude,
        'timestamp': formatted_ist
    }), 200


