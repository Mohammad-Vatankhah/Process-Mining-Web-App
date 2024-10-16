from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flasgger import Swagger
from flask_cors import CORS
from flask_mail import Mail

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()


def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configurations for the database connection
    app.config['SECRET_KEY'] = 'your-secret-key'
    app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:vatankhah4224@localhost/PMDB'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USERNAME'] = 'mamadvatan80@gmail.com'
    app.config['MAIL_PASSWORD'] = 'wkup ghph bgtk rxmd'
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False

    # Initialize the database with the Flask app
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    swagger = Swagger(app)

    # Import and register blueprints after initializing db
    from app.controllers.user_controller import user_bp
    from app.controllers.process_mining_controller import process_mining_bp

    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(process_mining_bp, url_prefix='/pm')

    # Import your models here, for example:
    from app.models import user  # Adjust this according to your actual model

    return app
