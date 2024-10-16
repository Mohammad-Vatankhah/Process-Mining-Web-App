from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required
from app import db
from app.models.user import User
from flasgger import swag_from


# Create a Blueprint for user management
user_bp = Blueprint('user', __name__)

@user_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    

    if not email or not password:
        return jsonify({'msg': 'Missing email or password'}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'msg': 'User already exists'}), 409

    # Create new user
    new_user = User(email=email, password=generate_password_hash(password))
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'msg': 'User created successfully'}), 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'msg': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id)
        return jsonify({'id': user.id, 'email': user.email, 'access_token': access_token}), 200

    return jsonify({'msg': 'Invalid email or password'}), 401

@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['User'],
    'description': 'Get a user by ID',
    'parameters': [
        {
            'name': 'Authorization',
            'in': 'header',
            'type': 'string',
            'required': True,
            'description': 'JWT Token to authorize the request (Bearer <token>)'
        },
        {
            'name': 'user_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'ID of the user to retrieve'
        }
    ],
    'responses': {
        200: {
            'description': 'User found',
            'examples': {
                'application/json': {
                    'id': 1,
                    'email': 'test@example.com'
                }
            }
        },
        404: {
            'description': 'User not found',
            'examples': {
                'application/json': {
                    'msg': 'User not found'
                }
            }
        }
    }
})
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({'id': user.id, 'email': user.email}), 200
    return jsonify({'msg': 'User not found'}), 404

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'msg': 'User deleted successfully'}), 200
    return jsonify({'msg': 'User not found'}), 404
