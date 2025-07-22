import os
from datetime import timedelta 


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "my-secret-key")
    
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
     
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "my-jwt-secret")   
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=50)

    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    

    