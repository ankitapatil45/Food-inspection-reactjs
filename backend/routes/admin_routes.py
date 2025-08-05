from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models import Employee, db, Location, City
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
    required_fields = ['name', 'username', 'phone', 'address', 'city_id', 'password', 'confirm_password']
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

    if admin.city_id != data['city_id']:
        return jsonify({'error': f"You can only assign workers to your own area (city id: {admin.city_id})"}), 403

    city = City.query.get(data['city_id'])
    if not city:
        return jsonify({'error': 'City not found'}), 400

    try:
        new_worker = Employee(
            name=data['name'],
            username=data['username'],
            phone=data['phone'],
            email=data.get('email'),
            address=data['address'],
            city_id=data['city_id'],
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
                'city': city.name
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
    city_id_filter = request.args.get('city_id', type=int)  # Updated to use city ID

    query = Employee.query.filter_by(role='worker')

    if claims['role'] == 'admin':
        admin = Employee.query.get_or_404(user_id)
        query = query.filter(Employee.city_id == admin.city_id)  # filter by city ID instead of city name

    if name_filter:
        query = query.filter(Employee.name.ilike(f'%{name_filter}%'))

    if city_id_filter:
        query = query.filter(Employee.city_id == city_id_filter)

    workers = query.all()

    result = []
    for w in workers:
        city_name = w.city.name if w.city else None  # Make sure relationship is set up in model
        result.append({
            'id': w.id,
            'name': w.name,
            'username': w.username,
            'email': w.email,
            'phone': w.phone,
            'address': w.address,
            'assigned_city': city_name,  # Return city name
            'city_id': w.city_id,        # Return city id
            'is_active': w.is_active,
            'created_at': w.created_at.strftime('%Y-%m-%d %H:%M:%S') if w.created_at else None,
            'created_by': w.created_by
        })

    return jsonify(result)



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

        # Prevent editing email and username
        if data.get('email') and data['email'] != worker.email:
            return jsonify({'error': 'Email cannot be changed'}), 400
        if data.get('username') and data['username'] != worker.username:
            return jsonify({'error': 'Username cannot be changed'}), 400

        # Only editable fields
        worker.name = data.get('name', worker.name)
        worker.phone = data.get('phone', worker.phone)
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
        if worker.city_id != admin.city_id:  # ✅ Updated check
            return jsonify({'error': 'You can only manage workers in your own city'}), 403

    worker.is_active = not worker.is_active
    db.session.commit()
    return jsonify({'message': f"Worker {'activated' if worker.is_active else 'deactivated'} successfully."})






# location worker

from datetime import timezone
import pytz  # Make sure this is imported at the top

@admin_bp.route('/admin/worker-location', methods=['GET'])
@jwt_required()
def get_worker_location():
    claims = get_jwt()
    role = claims.get('role')
    user_id = get_jwt_identity()

    if role not in ['admin', 'superadmin']:
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

    # ✅ Restrict admin to same city only
    if role == 'admin':
        admin = Employee.query.get(user_id)
        if worker.city_id != admin.city_id:
            return jsonify({'error': 'You can only view location of workers in your own city'}), 403

    latest_location = (
        Location.query
        .filter_by(worker_id=worker_id_int)
        .order_by(Location.timestamp.desc())
        .first()
    )

    if not latest_location:
        return jsonify({'error': 'No location found'}), 404

    # Convert to IST
    utc_time = latest_location.timestamp
    if utc_time.tzinfo is None:
        utc_time = utc_time.replace(tzinfo=timezone.utc)

    ist_timezone = pytz.timezone("Asia/Kolkata")
    ist_time = utc_time.astimezone(ist_timezone)
    formatted_ist = ist_time.strftime("%a, %d %b %Y %H:%M:%S IST")

    return jsonify({
        'latitude': latest_location.latitude,
        'longitude': latest_location.longitude,
        'timestamp': formatted_ist
    }), 200



#-------------------------------
# Get admin Profile
# -------------------------------
@admin_bp.route('/admin/profile', methods=['GET'])
@jwt_required()
def get_admin_profile():
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    admin = Employee.query.filter_by(id=get_jwt_identity(), role='admin').first()
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404

    return jsonify({
        'name': admin.name,
        'username': admin.username,
        'assigned_city': admin.city.name if admin.city else None,  # 👈 safely get city name
        'city_id': admin.city_id
    }), 200
