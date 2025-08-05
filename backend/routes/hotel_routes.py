from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, Hotel, Employee, City

hotel_bp = Blueprint('hotel', __name__)

# Create a new hotel (admin only, within assigned city)
@hotel_bp.route('/admin/create_hotel', methods=['POST'])
@jwt_required()
def create_hotel():
    data = request.get_json()
    name = data.get('name')
    phone = data.get('phone')
    address = data.get('address')
    location = data.get('location')

    claims = get_jwt()
    creator_id = get_jwt_identity()

    if claims.get('role') != 'admin':
        return jsonify({'error': 'Only admins can create hotels'}), 403

    creator = Employee.query.get_or_404(creator_id)
    if not creator.city_id:
        return jsonify({'error': 'Admin is not assigned to a city'}), 400

    # Prevent duplicates (same name+location in same city)
    duplicate = Hotel.query.filter_by(
        name=name,
        location=location,
        city_id=creator.city_id
    ).first()
    if duplicate:
        return jsonify({'error': 'Hotel already exists in your city with same name and location'}), 409

    new_hotel = Hotel(
        name=name,
        phone=phone,
        address=address,
        location=location,
        city_id=creator.city_id,   # 🟢 Admin's city
        created_by=creator_id
    )

    db.session.add(new_hotel)
    db.session.commit()

    return jsonify({'message': 'Hotel created successfully', 'hotel_id': new_hotel.id}), 201

#===============================================================
#==========================  list of hotel   ====================
#==============================================================

# Get list of hotels created by this admin
@hotel_bp.route('/hotel', methods=['GET'])
@jwt_required()
def list_hotels():
    claims = get_jwt()
    role = claims.get('role')
    user_id = get_jwt_identity()

    if role == 'admin':
        admin = Employee.query.get_or_404(user_id)
        if not admin.city_id:
            return jsonify({'error': 'Admin is not assigned to a city'}), 400
        hotels = Hotel.query.filter_by(city_id=admin.city_id).all()
        
    # elif role == 'worker':
    #     worker =  Employee.query.get_or_404(user_id)
    #     if not worker.city_id:
    #         return jsonify({'error': 'Admin is not assigned to a city'}) , 400  
    #     hotels = Hotel.query.filter_by(city_id=worker.city_id).all()

    elif role == 'superadmin':
        hotels = Hotel.query.all()

    else:
        return jsonify({'error': 'Unauthorized'}), 403

    result = [{
        'id': h.id,
        'name': h.name,
        'phone': h.phone,
        'address': h.address,
        'location': h.location,
        'city': h.city.name if h.city else None,
    
        'is_active': h.is_active
    } for h in hotels]

    return jsonify(result), 200

#==========================List of hotels for worker=====================================
@hotel_bp.route('/worker/hotels', methods=['GET'])
@jwt_required()
def list_hotels_for_worker():
    claims = get_jwt()
    role = claims.get('role')
    user_id = get_jwt_identity()

    if role != 'worker':
        return jsonify({'error': 'Unauthorized'}), 403

    worker = Employee.query.get_or_404(user_id)
    if not worker.city_id:
        return jsonify({'error': 'Worker is not assigned to a city'}), 400

    hotels = Hotel.query.filter_by(city_id=worker.city_id, is_active=True).all()

    result = [{
        'id': h.id,
        'name': h.name,
        'phone': h.phone,
        'address': h.address,
        'location': h.location,
        'city': h.city.name if h.city else None,
        'is_active': h.is_active
    } for h in hotels]

    return jsonify(result), 200


#===============================================================
#==========================  Update a hotel   ====================
#==============================================================
# Update a hotel (admin can update only their city hotels they created)
@hotel_bp.route('/hotel/<int:id>', methods=['PUT'])
@jwt_required()
def update_hotel(id):
    claims = get_jwt()
    role = claims.get('role')
    user_id = get_jwt_identity()

    hotel = Hotel.query.get_or_404(id)

    # Admin restriction: can only update hotel in their city
    if role == 'admin':
        admin = Employee.query.get_or_404(user_id)
        if hotel.city_id != admin.city_id:
            return jsonify({'error': 'You can update only hotels in your city'}), 403
    elif role != 'superadmin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()

    # Common fields
    hotel.name = data.get('name', hotel.name)
    hotel.phone = data.get('phone', hotel.phone)
    hotel.address = data.get('address', hotel.address)
    hotel.location = data.get('location', hotel.location)

    # Superadmin can update city
    if role == 'superadmin' and 'city_id' in data:
        new_city_id = data['city_id']
        if City.query.get(new_city_id):
            hotel.city_id = new_city_id
        else:
            return jsonify({'error': 'Invalid city_id'}), 400

    db.session.commit()
    return jsonify({'message': 'Hotel updated successfully'}), 200

#===============================================================
#==========================  delete hotels   ====================
#==============================================================

# Delete a hotel (admin can delete only their own hotels)
@hotel_bp.route('/hotel/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_hotel(id):
    claims = get_jwt()
    role = claims.get('role')
    admin_id = get_jwt_identity()

    if role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    hotel = Hotel.query.get_or_404(id)

    if hotel.created_by != admin_id:
        return jsonify({'error': 'You can delete only your own hotels'}), 403

    db.session.delete(hotel)
    db.session.commit()
    return jsonify({'message': 'Hotel deleted successfully'}), 200


#===============================================================
#==========================  Toggle hotels   ====================
#==============================================================

@hotel_bp.route('/hotel/<int:id>/toggle-status', methods=['PUT'])
@jwt_required()
def toggle_hotel_status(id):
    claims = get_jwt()
    role = claims.get('role')
    user_id = get_jwt_identity()

    if role not in ['admin', 'superadmin']:
        return jsonify({'error': 'Unauthorized'}), 403

    hotel = Hotel.query.get_or_404(id)

    if role == 'admin':
        admin = Employee.query.get_or_404(user_id)
        if hotel.city_id != admin.city_id:
            return jsonify({'error': 'You can only toggle hotels in your city'}), 403

    # Toggle active/inactive
    hotel.is_active = not hotel.is_active
    db.session.commit()

    return jsonify({
        'message': f'Hotel status changed to {"Active" if hotel.is_active else "Inactive"}',
        'status': hotel.is_active
    }), 200
