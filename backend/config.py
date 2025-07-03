import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "my-secret-key")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "my-jwt-secret")
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
