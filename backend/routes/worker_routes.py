# routes/worker_routes.py

import os
from datetime import datetime
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import Media, Hotel, db

worker_bp = Blueprint("worker", __name__)

# Upload configuration
UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'mp4', 'mov', 'avi'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@worker_bp.route('/worker/upload_media', methods=['POST'])
@jwt_required()
def upload_media():
    claims = get_jwt()
    if claims['role'] != 'worker':
        return jsonify({'error': 'Unauthorized: Only workers can upload media'}), 403

    worker_id = get_jwt_identity()

    # Check for file in request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed types are: jpg, png, mp4, mov, avi'}), 400

    # Form fields
    hotel_id = request.form.get('hotel_id')
    description = request.form.get('description', '')
    location = request.form.get('location', '')

    if not hotel_id:
        return jsonify({'error': 'Hotel ID is required'}), 400

    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({'error': 'Hotel not found'}), 404

    # Save file
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    saved_filename = f"{timestamp}_{filename}"
    file_path = os.path.join(UPLOAD_FOLDER, saved_filename)
    
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file.save(file_path)

    # Determine media type
    ext = filename.rsplit('.', 1)[1].lower()
    media_type = 'video' if ext in ['mp4', 'mov', 'avi'] else 'image'

    # Save to DB
    new_media = Media(
        filename=saved_filename,
        media_type=media_type,
        description=description,
        location=location,
        uploaded_by=worker_id,
        hotel_id=hotel_id
    )
    db.session.add(new_media)
    db.session.commit()

    return jsonify({'message': 'Media uploaded successfully'}), 201
