# routes/hotel_routes.py
from flask import Blueprint, request, jsonify
from models import Employee, Hotel, db
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import or_

hotel_bp = Blueprint('hotel', __name__)

# ---------------------
# Create Hotel (Admins Only - in their city)
# ---------------------
@hotel_bp.route('/admin/create_hotel', methods=['POST'])
@jwt_required()
def create_hotel():
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({'error': 'Unauthorized: Only admins can create hotels'}), 403

    admin_id = get_jwt_identity()
    admin = Employee.query.get_or_404(admin_id)

    data = request.get_json()
    name = data.get('name')
    phone = data.get('phone')
    address = data.get('address')
    location = data.get('location')

    if not all([name, phone, address, location]):
        return jsonify({'error': 'All fields (name, phone, address, location) are required'}), 400

    new_hotel = Hotel(
        name=name,
        phone=phone,
        address=address,
        location=location,
        city=admin.city,  # Set city same as admin
        created_by=admin_id
    )
    db.session.add(new_hotel)
    db.session.commit()

    return jsonify({'message': 'Hotel/Store created successfully'}), 201


# ---------------------
# Update or Delete Hotel (Admin: own city, Superadmin: all)
# ---------------------
@hotel_bp.route('/admin/hotel/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_or_delete_hotel(id):
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] not in ['admin', 'superadmin']:
        return jsonify({'error': 'Unauthorized'}), 403

    hotel = Hotel.query.get_or_404(id)

    # Admins can only update/delete their city’s hotels
    if claims['role'] == 'admin':
        admin = Employee.query.get_or_404(user_id)
        if hotel.city != admin.city:
            return jsonify({'error': 'Admins can only manage hotels in their city'}), 403

    if request.method == 'PUT':
        data = request.get_json()
        hotel.name = data.get('name', hotel.name)
        hotel.phone = data.get('phone', hotel.phone)
        hotel.address = data.get('address', hotel.address)
        hotel.location = data.get('location', hotel.location)
        db.session.commit()
        return jsonify({'message': 'Hotel updated successfully'}), 200

    elif request.method == 'DELETE':
        db.session.delete(hotel)
        db.session.commit()
        return jsonify({'message': 'Hotel deleted successfully'}), 200


# ---------------------
# List Hotels (super admin : All,Admin: own city, Worker: city)
# ---------------------
@hotel_bp.route('/hotels', methods=['GET'])
@jwt_required()
def list_hotels():
    try:
        claims = get_jwt()
        user_id = get_jwt_identity()
 
        if claims['role'] not in ['admin', 'worker', 'superadmin']:
            return jsonify({'error': 'Unauthorized'}), 403
 
        # Filters from query params
        name_filter = request.args.get('name', '').strip()
        city_filter = request.args.get('city', '').strip()
 
        # Base query
        if claims['role'] == 'admin':
            admin = Employee.query.get_or_404(user_id)
            query = Hotel.query.filter_by(city=admin.city)
 
        elif claims['role'] == 'worker':
            worker = Employee.query.get_or_404(user_id)
            query = Hotel.query.filter_by(city=worker.city)
 
        else:  # superadmin
            query = Hotel.query
 
        # Apply search filters
        if name_filter:
            query = query.filter(Hotel.name.ilike(f"%{name_filter}%"))
        if city_filter:
            query = query.filter(Hotel.city.ilike(f"%{city_filter}%"))
 
        hotels = query.all()
 
        return jsonify([
            {
                'id': hotel.id,
                'name': hotel.name,
                'phone': hotel.phone,
                'address': hotel.address,
                'location': hotel.location,
                'city': hotel.city,
                'created_by': hotel.created_by
            }
            for hotel in hotels
        ]), 200
 
    except Exception as e:
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500