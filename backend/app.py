# app.py
from flask import Flask, send_from_directory
from models import db
from config import Config
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from token_blacklist import blacklist
import os

# Import Blueprints
from routes import auth_bp, admin_bp, hotel_bp, worker_bp, media_bp
from routes.superadmin_routes import superadmin_bp

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    # ✅ Enable CORS for React frontend with credentials
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)


    # ✅ Initialize database and JWT manager
    db.init_app(app)
    jwt = JWTManager(app)

    # ✅ Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(hotel_bp, url_prefix="/api")
    app.register_blueprint(worker_bp, url_prefix="/api")
    app.register_blueprint(superadmin_bp, url_prefix="/api")
    app.register_blueprint(media_bp, url_prefix="/api")

    # ✅ Serve uploaded media files from /uploads folder
    @app.route('/api/uploads/<path:filename>')
    def uploaded_file(filename):
        uploads_dir = os.path.join(app.root_path, 'uploads')
        return send_from_directory(uploads_dir, filename)
    
    # ✅ Token Blacklist Check
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        return jwt_payload['jti'] in blacklist


    return app

# ✅ Run the app
if __name__ == '__main__':
    app = create_app()


    with app.app_context():
        db.create_all()

    app.run(debug=True)

