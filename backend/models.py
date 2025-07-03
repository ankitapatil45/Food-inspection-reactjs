
# backend/models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pytz

ist = pytz.timezone('Asia/Kolkata')

def ist_now():
    return datetime.now(ist).replace(tzinfo=None)  # Remove tzinfo to avoid issues in SQLite


db = SQLAlchemy()



class Employee(db.Model):
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(120))
    address = db.Column(db.Text, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='worker')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    IST_time = db.Column(db.DateTime, default=ist_now)

    created_by = db.Column(db.Integer, db.ForeignKey('employees.id'))
    creator = db.relationship('Employee', remote_side=[id], backref='created_employees')

    city = db.Column(db.String(100), nullable=False)

class Hotel(db.Model):
    __tablename__ = 'hotels'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)

    created_by = db.Column(db.Integer, db.ForeignKey('employees.id'))
    creator = db.relationship('Employee', backref='hotels')

class Certificate(db.Model):
    __tablename__ = 'certificates'

    id = db.Column(db.Integer, primary_key=True)
    certificate = db.Column(db.LargeBinary, nullable=False)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'), nullable=False)
    hotel = db.relationship('Hotel', backref='certificates')

class Media(db.Model):
    __tablename__ = 'media'

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    media_type = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(200), nullable=True)
    uploaded_at = db.Column(db.DateTime, default=ist_now)

    uploaded_by = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'), nullable=False)

    employee = db.relationship('Employee', backref='media_uploads', lazy=True)
    hotel = db.relationship('Hotel', backref='hotel_media', lazy=True)

print("✅ models.py loaded successfully")
