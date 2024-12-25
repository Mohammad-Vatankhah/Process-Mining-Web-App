from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
import os

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()


def create_app():
    app = Flask(__name__)
    CORS(app)
    # Configurations for the database connection
    app.config['SECRET_KEY'] = os.getenv("FLASL_SECRET_KEY")
    app.config['JWT_SECRET_KEY'] = os.getenv("FLASK_JWT_SECRET_KEY")
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("FLASK_SQLALCHEMY_DATABASE_URI")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USERNAME'] = os.getenv("FLASK_MAIL_USERNAME")
    app.config['MAIL_PASSWORD'] = os.getenv("FLASK_MAIL_PASSWORD")
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False

    # Initialize the database with the Flask app
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # Import and register blueprints after initializing db
    from app.controllers.user_controller import user_bp
    from app.controllers.process_mining_controller import process_mining_bp

    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(process_mining_bp, url_prefix='/pm')

    # Import your models here, for example:
    from app.models import user  # Adjust this according to your actual model

    return app
