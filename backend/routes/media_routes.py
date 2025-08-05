from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from models import Media, Employee, Hotel, City, db
import os
from collections import defaultdict
from sqlalchemy.orm import joinedload


media_bp = Blueprint("media", __name__)

# ---------------------
# Serve Uploaded Files
# ---------------------
@media_bp.route('/uploads/<filename>', methods=['GET'])
def serve_uploaded_file(filename):
    upload_folder = os.path.join(os.getcwd(), 'uploads')
    return send_from_directory(upload_folder, filename)




# ---------------------
# View_media by worker
# ---------------------

@media_bp.route('/media/worker/options', methods=['GET'])
@jwt_required()
def worker_dropdown_options():
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] != 'worker':
        return jsonify({'error': 'Unauthorized'}), 403

    # Hotels the worker has uploaded to
    hotel_ids = db.session.query(Media.hotel_id).filter(Media.uploaded_by == user_id).distinct()
    
    # Filter only active hotels
    hotels = Hotel.query.filter(Hotel.id.in_(hotel_ids), Hotel.is_active == True).all()

    return jsonify({
        'hotels': [{'id': h.id, 'name': h.name, 'city': h.city.name if h.city else None} for h in hotels]
    })

##Route

import json  # Make sure this is at the top

@media_bp.route('/media/worker/view', methods=['GET'])
@jwt_required()
def worker_view_media():
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] != 'worker':
        return jsonify({'error': 'Unauthorized'}), 403

    # Get only active hotel IDs
    active_hotel_ids = db.session.query(Hotel.id).filter(Hotel.is_active == True).subquery()

    # Filter media uploaded by this worker for active hotels only
    query = Media.query.filter(
        Media.uploaded_by == user_id,
        Media.hotel_id.in_(active_hotel_ids)
    )

    hotel_id = request.args.get('hotel_id')
    media_type = request.args.get('media_type')

    if hotel_id and hotel_id.isdigit():
        query = query.filter(Media.hotel_id == int(hotel_id))
    if media_type:
        query = query.filter(Media.media_type == media_type)

    media_list = query.order_by(Media.uploaded_at.desc()).all()

    result = []
    for m in media_list:
        latlon = None
        if m.location:
            try:
                loc = json.loads(m.location)
                lat = loc.get("latitude")
                lon = loc.get("longitude")
                if lat and lon:
                    latlon = f"{lat},{lon}"
            except Exception as e:
                latlon = None  # or log error if needed

        result.append({
            "id": m.id,
            "hotel": {
                "id": m.hotel.id,
                "name": m.hotel.name,
                "city": m.hotel.city.name if m.hotel.city else None
            },
            "media_type": m.media_type,
            "file_url": f"/api/uploads/{m.filename}",
            "description": m.description,
            "location": latlon,
            "uploaded_at": m.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify(result)




#======================#======================#======================#======================#======================#======================#======================
# ---------------------
# View Media by admin
# ---------------------
#======================
#===== admin_dropdown
#==========================
@media_bp.route('/media/admin/options', methods=['GET'])
@jwt_required()
def admin_dropdown_options():
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    admin = Employee.query.get_or_404(user_id)

    hotels = Hotel.query.filter_by(city_id=admin.city_id, is_active=True).all()
    workers = Employee.query.filter_by(city_id=admin.city_id, role='worker', is_active=True).all()

    return jsonify({
        'hotels': [{'id': h.id, 'name': h.name} for h in hotels],
        'workers': [{'id': w.id, 'name': w.name} for w in workers]
    })


#Route

import json

@media_bp.route('/media/admin/view', methods=['GET'])
@jwt_required()
def admin_view_media():
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    admin = Employee.query.get_or_404(user_id)

    # Active workers and hotels only in the same city
    allowed_worker_ids = db.session.query(Employee.id).filter(
        Employee.city_id == admin.city_id,
        Employee.role == 'worker',
        Employee.is_active == True
    ).subquery()

    allowed_hotel_ids = db.session.query(Hotel.id).filter(
        Hotel.city_id == admin.city_id,
        Hotel.is_active == True
    ).subquery()

    query = Media.query.filter(
        Media.uploaded_by.in_(allowed_worker_ids),
        Media.hotel_id.in_(allowed_hotel_ids)
    )

    # Optional filters
    worker_id = request.args.get('worker_id')
    hotel_id = request.args.get('hotel_id')
    media_type = request.args.get('media_type')

    if worker_id and worker_id.isdigit():
        query = query.filter(Media.uploaded_by == int(worker_id))
    if hotel_id and hotel_id.isdigit():
        query = query.filter(Media.hotel_id == int(hotel_id))
    if media_type:
        query = query.filter(Media.media_type == media_type)

    media_list = query.order_by(Media.uploaded_at.desc()).all()

    result = []
    for m in media_list:
        latlon = None
        if m.location:
            try:
                loc = json.loads(m.location)
                lat = loc.get("latitude")
                lon = loc.get("longitude")
                if lat and lon:
                    latlon = f"{lat},{lon}"
            except Exception:
                latlon = None

        result.append({
            'id': m.id,
            'filename': m.filename,
            'media_type': m.media_type,
            'description': m.description,
            'location': latlon,
            'uploaded_at': m.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
            'file_url': f"/api/uploads/{m.filename}",
            'worker': {
                'id': m.employee.id if m.employee else None,
                'name': m.employee.name if m.employee else 'Unknown',
                'city': {
                    'id': m.employee.city.id,
                    'name': m.employee.city.name
                } if m.employee and m.employee.city else 'Unknown'
            },
            'hotel': {
                'id': m.hotel.id if m.hotel else None,
                'name': m.hotel.name if m.hotel else 'Unknown',
                'location': m.hotel.location if m.hotel else 'Unknown',
                'city': {
                    'id': m.hotel.city.id,
                    'name': m.hotel.city.name
                } if m.hotel and m.hotel.city else 'Unknown'
            }
        })

    return jsonify(result)


#======================#======================#======================#======================#======================#======================#======================
# ---------------------
# ---------------------
#             View Media by superadmin

#            superadmin_dropdown
#==========================

def _parse_location(location_str):
    try:
        data = eval(location_str) if isinstance(location_str, str) else location_str
        lat = data.get("latitude") or data.get("lat")
        lon = data.get("longitude") or data.get("lon")
        return f"{lat},{lon}" if lat and lon else None
    except:
        return None





# --- Flask Backend Route ---

@media_bp.route("/media/superadmin/options", methods=["GET"])
@jwt_required()
def get_superadmin_media_options():
    cities = City.query.all()

    # Get all active hotels
    hotels = Hotel.query.options(joinedload(Hotel.city)).filter(
        Hotel.is_active == True
    ).all()

    # Get all active workers whose city_id matches the city of any hotel
    active_city_ids = {h.city_id for h in hotels}
    workers = Employee.query.options(joinedload(Employee.city)).filter(
        Employee.role == "worker",
        Employee.is_active == True,
        Employee.city_id.in_(active_city_ids)
    ).all()

    return jsonify({
        "areas": [{"id": c.id, "name": c.name} for c in cities],
        "hotels": [
            {
                "id": h.id,
                "name": h.name,
                "city_id": h.city.id if h.city else None
            } for h in hotels
        ],
        "workers": [
            {
                "id": w.id,
                "name": w.name,
                "city_id": w.city.id if w.city else None
            } for w in workers
        ]
    })



@media_bp.route('/media/superadmin/view', methods=['GET'])
@jwt_required()
def superadmin_view_media():
    claims = get_jwt()
    if claims['role'] != 'superadmin':
        return jsonify({'error': 'Unauthorized'}), 403

    query = Media.query.options(
        joinedload(Media.employee).joinedload(Employee.city),
        joinedload(Media.hotel).joinedload(Hotel.city)
    )

    area = request.args.get('area_id')
    hotel_id = request.args.get('hotel_id')
    worker_id = request.args.get('worker_id')
    media_type = request.args.get('media_type')

    if area:
        query = query.join(Hotel).join(City).filter(City.id == int(area))

    if hotel_id:
        query = query.filter(Media.hotel_id == int(hotel_id))

    if worker_id:
        query = query.filter(Media.uploaded_by == int(worker_id))

    if media_type:
        query = query.filter(Media.media_type == media_type)

    media_list = query.order_by(Media.uploaded_at.desc()).all()

    return jsonify([
        {
            'id': m.id,
            'filename': m.filename,
            'media_type': m.media_type,
            'description': m.description,
            'location': _parse_location(m.location),
            'uploaded_at': m.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
            'file_url': f"/api/uploads/{m.filename}",
            'uploaded_by_name': m.employee.name if m.employee else 'Unknown',
            'worker': {
                'id': m.employee.id if m.employee else None,
                'name': m.employee.name if m.employee else 'Unknown',
                'city': {
                    'id': m.employee.city.id,
                    'name': m.employee.city.name
                } if m.employee and m.employee.city else 'Unknown'
            },
            'hotel': {
                'id': m.hotel.id if m.hotel else None,
                'name': m.hotel.name if m.hotel else 'Unknown',
                'location': m.hotel.location if m.hotel else 'Unknown',
                'city': {
                    'id': m.hotel.city.id,
                    'name': m.hotel.city.name
                } if m.hotel and m.hotel.city else 'Unknown'
            }
        }
        for m in media_list
    ])




#==============================================================
#======================= Deleting =======================================
#==============================================================
### Worker
@media_bp.route('/media/<int:media_id>', methods=['DELETE'])
@jwt_required()
def delete_worker_media(media_id):
    claims = get_jwt()
    user_id = get_jwt_identity()

    print("➡️ JWT user_id:", user_id)
    print("➡️ JWT role:", claims['role'])

    if claims['role'] != 'worker':
        return jsonify({'error': 'Unauthorized'}), 403

    media = Media.query.get(media_id)
    if not media:
        return jsonify({'error': 'Media not found'}), 404

    print("➡️ Media uploaded_by:", media.uploaded_by)

    # ✅ Typecast to int to avoid mismatch
    if int(media.uploaded_by) != int(user_id):
        print("❌ Uploaded_by mismatch – Forbidden")
        return jsonify({'error': 'You can only delete your own uploads'}), 403

    db.session.delete(media)
    db.session.commit()

    print("✅ Media deleted")
    return jsonify({'message': 'Media deleted successfully'}), 200





##Admin
@media_bp.route('/media/admin/delete/<int:media_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_media(media_id):
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    admin = Employee.query.get_or_404(user_id)
    media = Media.query.get_or_404(media_id)

    # ✅ Fix: convert query result to list of ids
    allowed_worker_ids = [row[0] for row in db.session.query(Employee.id).filter(Employee.created_by == admin.id).all()]
    allowed_hotel_ids = [row[0] for row in db.session.query(Hotel.id).filter(Hotel.created_by == admin.id).all()]

    if not (
        media.uploaded_by in allowed_worker_ids or
        media.hotel_id in allowed_hotel_ids
    ):
        return jsonify({'error': 'Forbidden: Not your media'}), 403

    # Delete physical file if it exists
    try:
        file_path = os.path.join('uploads', media.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Warning: Could not delete file {file_path}: {e}")
    db.session.delete(media)
    db.session.commit()
    return jsonify({'message': 'Media deleted successfully'})

##SuperAdmin-delete
@media_bp.route('/media/superadmin/delete/<int:media_id>', methods=['DELETE'])
@jwt_required()
def superadmin_delete_media(media_id):
    claims = get_jwt()
    if claims['role'] != 'superadmin':
        return jsonify({'error': 'Unauthorized'}), 403

    media = Media.query.get_or_404(media_id)

    # Optional: delete physical file
    try:
        file_path = os.path.join('uploads', media.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Warning: Could not delete file {file_path}: {e}")

    db.session.delete(media)
    db.session.commit()
    return jsonify({'message': 'Media deleted by superadmin'})

