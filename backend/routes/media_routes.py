from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from models import Media, Employee, Hotel, db
import os

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
    hotels = Hotel.query.filter(Hotel.id.in_(hotel_ids)).all()

    return jsonify({
        'hotels': [{'id': h.id, 'name': h.name, 'city': h.city} for h in hotels]
    })

##Route

@media_bp.route('/media/worker/view', methods=['GET'])
@jwt_required()
def worker_view_media():
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] != 'worker':
        return jsonify({'error': 'Unauthorized'}), 403

    query = Media.query.filter(Media.uploaded_by == user_id)

    hotel_id = request.args.get('hotel_id')
    media_type = request.args.get('media_type')

    # Convert to int only if not empty
    if hotel_id and hotel_id.isdigit():
        query = query.filter(Media.hotel_id == int(hotel_id))
    if media_type:
        query = query.filter(Media.media_type == media_type)

    media_list = query.order_by(Media.uploaded_at.desc()).all()

    return jsonify([
        {
            'id': m.id,
            'filename': m.filename,
            'media_type': m.media_type,
            'description': m.description,
            'location': m.location,
            'uploaded_at': m.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
            'file_url': f"/api/uploads/{m.filename}",
            'hotel': {
                'id': m.hotel.id if m.hotel else None,
                'name': m.hotel.name if m.hotel else 'Unknown',
                'location': m.hotel.location if m.hotel else 'Unknown',
                'city': m.hotel.city if m.hotel else 'Unknown',
            }
        } for m in media_list
    ])


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

    hotels = Hotel.query.filter_by(created_by=user_id).all()
    workers = Employee.query.filter_by(created_by=user_id, role='worker').all()

    return jsonify({
        'hotels': [{'id': h.id, 'name': h.name} for h in hotels],
        'workers': [{'id': w.id, 'name': w.name} for w in workers]
    })

#Route

@media_bp.route('/media/admin/view', methods=['GET'])
@jwt_required()
def admin_view_media():
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    admin = Employee.query.get_or_404(user_id)

    # Only include workers and hotels created by this admin
    allowed_worker_ids = db.session.query(Employee.id).filter(Employee.created_by == admin.id).subquery()
    allowed_hotel_ids = db.session.query(Hotel.id).filter(Hotel.created_by == admin.id).subquery()

    query = Media.query.filter(
        (Media.uploaded_by.in_(allowed_worker_ids)) |
        (Media.hotel_id.in_(allowed_hotel_ids))
    )

    worker_id = request.args.get('worker_id')
    hotel_id = request.args.get('hotel_id')
    media_type = request.args.get('media_type')

    if worker_id:
        query = query.filter(Media.uploaded_by == worker_id)
    if hotel_id:
        query = query.filter(Media.hotel_id == hotel_id)
    if media_type:
        query = query.filter(Media.media_type == media_type)

    media_list = query.order_by(Media.uploaded_at.desc()).all()

    return jsonify([
        {
            'id': m.id,
            'filename': m.filename,
            'media_type': m.media_type,
            'description': m.description,
            'location': m.location,
            'uploaded_at': m.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
            'file_url': f"/api/uploads/{m.filename}",
            'worker': {
                'id': m.employee.id if m.employee else None,
                'name': m.employee.name if m.employee else 'Unknown'
            },
            'hotel': {
                'id': m.hotel.id if m.hotel else None,
                'name': m.hotel.name if m.hotel else 'Unknown',
                'location': m.hotel.location if m.hotel else 'Unknown',
            }
        } for m in media_list
    ])

#======================#======================#======================#======================#======================#======================#======================
# ---------------------
# ---------------------
#             View Media by superadmin

#            superadmin_dropdown
#==========================
@media_bp.route('/media/superadmin/options', methods=['GET'])
@jwt_required()
def superadmin_dropdown_options():
    claims = get_jwt()
    if claims['role'] != 'superadmin':
        return jsonify({'error': 'Unauthorized'}), 403

    superadmin_id = get_jwt_identity()

    # Get admins created by this superadmin
    admins = Employee.query.filter_by(created_by=superadmin_id, role='admin').all()
    admin_ids = [admin.id for admin in admins]

    # Get hotels created by those admins
    hotels = Hotel.query.filter(Hotel.created_by.in_(admin_ids)).all()
    hotel_ids = [hotel.id for hotel in hotels]

    # Get workers created by those admins
    workers = Employee.query.filter(Employee.created_by.in_(admin_ids), Employee.role == 'worker').all()

    # Extract unique areas from those hotels
    areas = list(set(h.city for h in hotels))

    return jsonify({
        'areas': areas,
        'hotels': [{'id': h.id, 'name': h.name, 'city': h.city} for h in hotels],
        'workers': [{'id': w.id, 'name': w.name, 'city': w.city} for w in workers]
    })



###Route

@media_bp.route('/media/superadmin/view', methods=['GET'])
@jwt_required()
def superadmin_view_media():
    claims = get_jwt()
    superadmin_id = get_jwt_identity()

    if claims['role'] != 'superadmin':
        return jsonify({'error': 'Unauthorized'}), 403

    # Step 1: Get admins created by this superadmin
    admins = Employee.query.filter_by(created_by=superadmin_id, role='admin').all()
    admin_ids = [admin.id for admin in admins]

    # Step 2: Get hotels and workers created by those admins
    hotels = Hotel.query.filter(Hotel.created_by.in_(admin_ids)).all()
    hotel_ids = [h.id for h in hotels]

    workers = Employee.query.filter(Employee.created_by.in_(admin_ids), Employee.role == 'worker').all()
    worker_ids = [w.id for w in workers]

    # Step 3: Start query with allowed hotel or worker matches
    query = Media.query.filter(
        db.or_(
            Media.hotel_id.in_(hotel_ids),
            Media.uploaded_by.in_(worker_ids)
        )
    )

    # Step 4: Apply filters
    area = request.args.get('area')
    hotel_id = request.args.get('hotel_id')
    worker_id = request.args.get('worker_id')
    media_type = request.args.get('media_type')

    if area:
        query = query.join(Hotel).filter(Hotel.city == area)
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
            'location': m.location,
            'uploaded_at': m.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
            'file_url': f"/api/uploads/{m.filename}",
            'worker': {
                'id': m.employee.id if m.employee else None,
                'name': m.employee.name if m.employee else 'Unknown',
                'city': m.employee.city if m.employee else 'Unknown'
            },
            'hotel': {
                'id': m.hotel.id if m.hotel else None,
                'name': m.hotel.name if m.hotel else 'Unknown',
                'location': m.hotel.location if m.hotel else 'Unknown',
                'city': m.hotel.city if m.hotel else 'Unknown'
            }
        } for m in media_list
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

