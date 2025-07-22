from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import Employee, db, Location
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

admin_bp = Blueprint('admin', __name__)

# -------------------------------
# ✅ Create Worker (Only Admins)
# -------------------------------
@admin_bp.route('/admin/create-worker', methods=['POST'])
@jwt_required()
def create_worker():
    admin_id = get_jwt_identity()
    claims = get_jwt()

    if claims['role'] != 'admin':
        return jsonify({'error': 'Only admins can create workers'}), 403

    data = request.get_json()
    required_fields = ['name', 'username', 'phone', 'address', 'assigned_area', 'password', 'confirm_password']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f"{field} is required"}), 400

    if data['password'] != data['confirm_password']:
        return jsonify({'error': "Passwords do not match"}), 400

    if Employee.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400

    if data.get('email') and Employee.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already used'}), 400

    admin = Employee.query.filter_by(id=admin_id, role='admin').first()
    if not admin:
        return jsonify({'error': 'Admin not found'}), 400

    if data['assigned_area'] != admin.city:
        return jsonify({'error': f"You can only assign workers to your own area: {admin.city}"}), 403

    try:
        new_worker = Employee(
            name=data['name'],
            username=data['username'],
            phone=data['phone'],
            email=data.get('email'),
            address=data['address'],
            city=data['assigned_area'],
            password=generate_password_hash(data['password']),
            created_by=admin_id,
            role='worker',
            is_active=True
        )
        db.session.add(new_worker)
        db.session.commit()
        return jsonify({
            'message': 'Worker created successfully',
            'worker': {
                'name': new_worker.name,
                'username': new_worker.username,
                'assigned_area': new_worker.city
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# -------------------------------
# ✅ List Workers (Admin & Superadmin)
# -------------------------------
@admin_bp.route('/admin/workers', methods=['GET'])
@jwt_required()
def list_workers():
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] not in ['admin', 'superadmin']:
        return jsonify({'error': 'Unauthorized'}), 403

    name_filter = request.args.get('name')
    area_filter = request.args.get('assigned_area')

    query = Employee.query.filter_by(role='worker')

    if claims['role'] == 'admin':
        admin = Employee.query.get_or_404(user_id)
        query = query.filter(Employee.city == admin.city)

    if name_filter:
        query = query.filter(Employee.name.ilike(f'%{name_filter}%'))
    if area_filter:
        query = query.filter(Employee.city == area_filter)

    workers = query.all()

    return jsonify([
        {
            'id': w.id,
            'name': w.name,
            'username': w.username,
            'email': w.email,
            'phone': w.phone,
            'address': w.address,
            'assigned_area': w.city,
            'is_active': w.is_active,
            'created_at': w.created_at.strftime('%Y-%m-%d %H:%M:%S') if w.created_at else None,
            'created_by': w.created_by
        } for w in workers
    ])


# -------------------------------
# ✅ Update or Delete Worker
# -------------------------------
@admin_bp.route('/admin/worker/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_delete_worker(id):
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] not in ['admin', 'superadmin']:
        return jsonify({'error': 'Unauthorized'}), 403

    worker = Employee.query.get_or_404(id)

    if worker.role != 'worker':
        return jsonify({'error': 'Not a worker'}), 400

    if claims['role'] == 'admin':
        admin = Employee.query.get_or_404(user_id)
        if worker.city != admin.city:
            return jsonify({'error': 'You can only manage workers in your own city'}), 403

    if request.method == 'PUT':
        data = request.get_json()

        worker.name = data.get('name', worker.name)
        worker.phone = data.get('phone', worker.phone)
        worker.email = data.get('email', worker.email)
        worker.address = data.get('address', worker.address)

        new_password = data.get('password')
        confirm_password = data.get('confirm_password')
        if new_password:
            if not confirm_password:
                return jsonify({'error': 'Please confirm the new password'}), 400
            if new_password != confirm_password:
                return jsonify({'error': 'Passwords do not match'}), 400
            worker.password = generate_password_hash(new_password)

        db.session.commit()
        return jsonify({'message': 'Worker updated successfully'}), 200

    elif request.method == 'DELETE':
        db.session.delete(worker)
        db.session.commit()
        return jsonify({'message': 'Worker deleted successfully'}), 200


# -------------------------------
# ✅ Toggle Worker Status (Active / Inactive)
# -------------------------------
@admin_bp.route('/admin/worker/<int:id>/toggle-status', methods=['PUT'])
@jwt_required()
def toggle_worker_status(id):
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] not in ['admin', 'superadmin']:
        return jsonify({'error': 'Unauthorized'}), 403

    worker = Employee.query.get_or_404(id)

    if worker.role != 'worker':
        return jsonify({'error': 'Not a worker'}), 400

    if claims['role'] == 'admin':
        admin = Employee.query.get_or_404(user_id)
        if worker.city != admin.city:
            return jsonify({'error': 'You can only manage workers in your own city'}), 403

    worker.is_active = not worker.is_active
    db.session.commit()
    return jsonify({'message': f"Worker {'activated' if worker.is_active else 'deactivated'} successfully."})






# location worker

@admin_bp.route('/admin/location', methods=['GET'])
@jwt_required()
def get_worker_location():
    claims = get_jwt()
    role = claims.get('role')

    if role not in ['admin', 'superadmin']:
        return jsonify({'error': 'Unauthorized'}), 403

    worker_id = request.args.get('worker_id')
    if not worker_id:
        return jsonify({'error': 'worker_id is required'}), 400

    latest_location = Location.query.filter_by(worker_id=worker_id).order_by(Location.timestamp.desc()).first()

    if not latest_location:
        return jsonify({'error': 'No location found'}), 404

    return jsonify({
        'latitude': latest_location.latitude,
        'longitude': latest_location.longitude,
        'timestamp': latest_location.timestamp
    }), 200
