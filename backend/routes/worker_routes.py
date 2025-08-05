# routes/worker_routes.py

import os
from datetime import datetime
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import Media, Hotel, Location, Employee, db
from pytz import timezone
ist = timezone('Asia/Kolkata')
worker_bp = Blueprint("worker", __name__)

# Upload configuration
UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'mp4', 'mov', 'avi', 'webm'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

#-=====================
#==Upload media by worker 
#=========================


@worker_bp.route('/worker/upload_media', methods=['POST'])
@jwt_required()
def upload_media():
    claims = get_jwt()
    if claims['role'] != 'worker':
        return jsonify({'error': 'Unauthorized: Only workers can upload media'}), 403

    worker_id = get_jwt_identity()

    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed types are: jpg, png, mp4, mov, avi, webm'}), 400

    hotel_id = request.form.get('hotel_id')
    description = request.form.get('description', '').strip()
    location = request.form.get('location', '').strip()

    if not hotel_id:
        return jsonify({'error': 'Hotel ID is required'}), 400

    hotel = Hotel.query.get(hotel_id)
    worker = Employee.query.get(worker_id)

    if not hotel:
        return jsonify({'error': 'Hotel not found'}), 404

    if not hotel.is_active:
        return jsonify({'error': 'Cannot upload to inactive hotel'}), 403

    if hotel.city_id != worker.city_id:
        return jsonify({'error': 'You can only upload media to hotels in your city'}), 403

    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    saved_filename = f"{timestamp}_{filename}"
    file_path = os.path.join(UPLOAD_FOLDER, saved_filename)

    try:
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file.save(file_path)
    except Exception as e:
        return jsonify({'error': f'Failed to save file: {str(e)}'}), 500

    ext = filename.rsplit('.', 1)[1].lower()
    media_type = 'video' if ext in ['mp4', 'mov', 'avi', 'webm'] else 'image'

    new_media = Media(
        filename=saved_filename,
        media_type=media_type,
        description=description,
        location=location,
        uploaded_by=worker_id,
        hotel_id=hotel_id,
        uploaded_at=datetime.now()  # Use IST if needed
    )

    db.session.add(new_media)
    db.session.commit()

    return jsonify({'message': 'Media uploaded successfully'}), 201



#=========================#=========================
#=============Worker Live Location Update============
#=========================#=========================

from datetime import datetime
import pytz  # make sure pytz is installed

IST = pytz.timezone('Asia/Kolkata')

@worker_bp.route('/location', methods=['POST'])
@jwt_required()
def update_location():
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] != 'worker':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    lat = data.get('latitude')
    lon = data.get('longitude')

    if not lat or not lon:
        return jsonify({'error': 'Missing coordinates'}), 400

    # Update if exists, else create new
    location = Location.query.filter_by(worker_id=user_id).first()

    if location:
        location.latitude = lat
        location.longitude = lon
        location.timestamp = datetime.utcnow()
    else:
        location = Location(worker_id=user_id, latitude=lat, longitude=lon)

    db.session.add(location)
    db.session.commit()

    return jsonify({'message': 'Location updated'}), 200


#=========================#=========================
#=============Worker can see  Live Location Update============
#=========================#=========================

@worker_bp.route('/location', methods=['GET'])
@jwt_required()
def get_own_location():
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims['role'] != 'worker':
        return jsonify({'error': 'Unauthorized'}), 403

    latest_location = Location.query.filter_by(worker_id=user_id).order_by(Location.timestamp.desc()).first()

    if not latest_location:
        return jsonify({'error': 'No location found'}), 404

    # Convert timestamp to IST
    utc_time = latest_location.timestamp.replace(tzinfo=pytz.utc)
    ist_time = utc_time.astimezone(IST)

    return jsonify({
        'latitude': latest_location.latitude,
        'longitude': latest_location.longitude,
        'timestamp': latest_location.timestamp,       # UTC timestamp (original)
        'timestamp_ist': ist_time.strftime('%Y-%m-%d %H:%M:%S')  # Formatted IST
    }), 200