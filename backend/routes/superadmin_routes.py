from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash
from sqlalchemy import or_
from models import db, Employee, Location

superadmin_bp = Blueprint('superadmin', __name__)

# ✅ Fixed 20 predefined areas
PREDEFINED_AREAS = [
    "Shivajinagar", "Kothrud", "Baner", "Hinjewadi", "Wakad",
    "Aundh", "Kharadi", "Viman Nagar", "Hadapsar", "Camp",
    "Kondhwa", "Katraj", "Pimpri", "Chinchwad", "Akurdi",
    "Nigdi", "Ravet", "Pimple Saudagar", "Pimple Gurav", "Thergaon"
]

# --------------------------
# ✅ Get all predefined areas
# --------------------------
@superadmin_bp.route('/areas', methods=['GET'])
def get_areas():
    return jsonify(PREDEFINED_AREAS)

# --------------------------
# ✅ Create Admin (Only Superadmin)
# --------------------------
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
            'phone': a.phone,
            'city': a.city,
            'address': a.address,
            'is_active': a.is_active  # ✅ Add this line
        } for a in admins
    ]), 200


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
            'address': w.address,
            'address': w.address,
            'is_active': w.is_active
        } for w in workers
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
                'city': admin.city
            },
            'workers': [
                {
                    'id': w.id,
                    'name': w.name,
                    'username': w.username,
                    'phone': w.phone,
                    'city': w.city,
                    

                } for w in workers
            ]
        }), 200

    except Exception as e:
        print("❌ Internal Server Error:", str(e))
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500


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
        db.session.commit()
        return jsonify({'message': 'Worker updated successfully'}), 200

    elif request.method == 'DELETE':
        db.session.delete(worker)
        db.session.commit()
        return jsonify({'message': 'Worker deleted successfully'}), 200


# -------------------------------
# ✅  Get Worker Live locaton
# -------------------------------

@superadmin_bp.route('/locations', methods=['GET'])
@jwt_required()
def get_all_workers_locations():
    claims = get_jwt()

    if claims['role'] != 'superadmin':
        return jsonify({'error': 'Unauthorized'}), 403

    locations = (
        db.session.query(Location)
        .join(Employee)
        .filter(Employee.role == 'worker')
        .group_by(Location.worker_id)
        .order_by(Location.timestamp.desc())
        .all()
    )

    return jsonify([
        {
            'worker_id': loc.worker_id,
            'name': loc.worker.name,
            'latitude': loc.latitude,
            'longitude': loc.longitude,
            'timestamp': loc.timestamp
        } for loc in locations
    ]), 200
