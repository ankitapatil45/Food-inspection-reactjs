from flask import Flask
from models import db
from config import Config
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Import Blueprints
from routes import auth_bp, admin_bp, hotel_bp, worker_bp, superadmin_bp





def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    # Enable CORS
    CORS(app)

    # Initialize Extensions
    db.init_app(app)
    JWTManager(app)


    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(hotel_bp, url_prefix="/api")
    app.register_blueprint(worker_bp, url_prefix="/api")
    app.register_blueprint(superadmin_bp, url_prefix="/api")


    return app

# Run the app
if __name__ == '__main__':
    app = create_app()

    print("🚀 Starting Flask app on http://localhost:5000")
    with app.app_context():
        db.create_all()

    app.run(debug=True)
