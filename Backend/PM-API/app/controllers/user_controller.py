from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required
from app import db, mail, jwt
from app.models.user import User
from flasgger import swag_from
from flask_mail import Message
from datetime import timedelta
from flask_jwt_extended import decode_token
from jwt import ExpiredSignatureError, InvalidTokenError

# Create a Blueprint for user management
user_bp = Blueprint('user', __name__)

RESET_PASSWORD_EXPIRATION_MINUTES = 15


@user_bp.route('/signup', methods=['POST'])
@swag_from({
    'tags': ['Auth'],
    'summary': 'Signup a new user',
    'description': 'Create a new user account',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'email': {'type': 'string', 'example': 'test@example.com'},
                    'password': {'type': 'string', 'example': 'strong_password'}
                },
                'required': ['email', 'password']
            }
        }
    ],
    'responses': {
        201: {
            'description': 'User created successfully',
            'examples': {
                'application/json': {
                    'msg': 'User created successfully',
                    'user_data': {
                        'id': 1,
                        'email': 'test@example.com',
                        'access_token': 'some_token'
                    }
                }
            }
        },
        400: {'description': 'Missing email or password'},
        409: {'description': 'User already exists'}
    }
})
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
    access_token = create_access_token(identity=new_user.id, expires_delta=None)
    return jsonify({'msg': 'User created successfully',
                    'user_data': {'id': new_user.id, 'email': new_user.email, 'access_token': access_token}}), 201


@user_bp.route('/login', methods=['POST'])
@swag_from({
    'tags': ['Auth'],
    'summary': 'Login an existing user',
    'description': 'Authenticate a user and return an access token',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'email': {'type': 'string', 'example': 'test@example.com'},
                    'password': {'type': 'string', 'example': 'strong_password'}
                },
                'required': ['email', 'password']
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Login successful',
            'examples': {
                'application/json': {
                    'id': 1,
                    'email': 'test@example.com',
                    'access_token': 'some_token'
                }
            }
        },
        400: {'description': 'Missing email or password'},
        401: {'description': 'Invalid email or password'}
    }
})
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'msg': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id, expires_delta=None)
        return jsonify({'id': user.id, 'email': user.email, 'access_token': access_token}), 200

    return jsonify({'msg': 'Invalid email or password'}), 401


@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Auth'],
    'summary': 'Login an existing user details using user token and id',
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
@swag_from({
    'tags': ['Auth'],
    'summary': 'Delete a user by ID',
    'description': 'Delete a user from the database',
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
            'description': 'ID of the user to delete'
        }
    ],
    'responses': {
        200: {
            'description': 'User deleted successfully',
            'examples': {
                'application/json': {
                    'msg': 'User deleted successfully'
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
@jwt_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'msg': 'User deleted successfully'}), 200
    return jsonify({'msg': 'User not found'}), 404


def generate_reset_token(user_id):
    """Generate JWT token for password reset using Flask-JWT-Extended."""
    # Create a short-lived token
    token = create_access_token(identity=user_id, expires_delta=timedelta(minutes=15))
    return token


def verify_reset_token(token):
    """Verify the JWT token and return the user ID using Flask-JWT-Extended."""
    try:
        # Decode the token using decode_token from Flask-JWT-Extended
        decoded_token = decode_token(token)
        return decoded_token['sub']  # 'sub' stores the user ID
    except Exception as e:
        return None


@user_bp.route('/request-password-reset', methods=['POST'])
@swag_from({
    'tags': ['Auth'],
    'summary': 'Request password reset',
    'description': 'Generate a password reset token and send it via email',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'email': {'type': 'string', 'example': 'test@example.com'}
                },
                'required': ['email']
            }
        }
    ],
    'responses': {
        200: {'description': 'Password reset email sent'},
        400: {'description': 'Email is required'},
        404: {'description': 'User not found'}
    }
})
def request_password_reset():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({'msg': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    # Generate the reset token
    token = generate_reset_token(user.id)

    # Prepare the reset URL (Frontend reset link with token)
    reset_url = f"http://localhost:3000/reset-password?token={token}"

    # Send the reset email
    msg = Message(
        subject="Password Reset Request",
        sender="mamadvatan80@gmail.com",
        recipients=[user.email]
    )
    msg.body = f"To reset your password, click the following link: {
    reset_url} \n This link is valid for 15 minutes."
    mail.send(msg)

    return jsonify({'msg': 'Password reset email sent'}), 200


@user_bp.route('/reset-password', methods=['POST'])
@swag_from({
    'tags': ['Auth'],
    'summary': 'Reset a user\'s password using a token',
    'description': 'Reset a user\'s password using a token',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'token': {
                        'type': 'string',
                        'example': 'your_jwt_token'
                    },
                    'new_password': {
                        'type': 'string',
                        'example': 'newstrongpassword'
                    }
                },
                'required': ['token', 'new_password']
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Password updated successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {
                        'type': 'string',
                        'example': 'Password updated successfully'
                    }
                }
            }
        },
        400: {
            'description': 'Token and new password are required',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {
                        'type': 'string',
                        'example': 'Token and new password are required'
                    }
                }
            }
        },
        404: {
            'description': 'User not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {
                        'type': 'string',
                        'example': 'User not found'
                    }
                }
            }
        }
    }
})
def reset_password():
    data = request.json
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({'msg': 'Token and new password are required'}), 400

    # Verify the token
    user_id = verify_reset_token(token)
    if not user_id:
        return jsonify({'msg': 'Invalid or expired token'}), 400

    # Update the user's password
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    # Hash the new password and save it
    user.password = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({'msg': 'Password updated successfully'}), 200


@user_bp.route('/check-reset-token', methods=['POST'])
@swag_from({
    'tags': ['Auth'],
    'description': 'Check if the password reset token is valid',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'token': {
                        'type': 'string',
                        'example': 'your_jwt_token'
                    }
                },
                'required': ['token']
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Token is valid',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {
                        'type': 'string',
                        'example': 'Token is valid'
                    }
                }
            }
        },
        400: {
            'description': 'Token is required',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {
                        'type': 'string',
                        'example': 'Token is required'
                    }
                }
            }
        },
        401: {
            'description': 'Invalid token',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {
                        'type': 'string',
                        'example': 'Invalid token'
                    }
                }
            }
        }
    }
})
def check_reset_token():
    data = request.get_json()

    if not data or 'token' not in data:
        return jsonify({'msg': 'Token is required'}), 400

    token = data['token']

    try:
        # Verify the token using decode_token
        payload = decode_token(token)  # Pass the token directly, not data

        # If token is valid, return success message
        return jsonify({'msg': 'Token is valid'}), 200
    except ExpiredSignatureError:
        return jsonify({'msg': 'Token has expired'}), 401
    except InvalidTokenError:
        return jsonify({'msg': 'Invalid token'}), 401


@user_bp.route('/<int:user_id>/files', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['User Files'],
    'summary': 'Get User\'s Uploaded Files with JWT Authentication',
    'description': 'Retrieve a list of files uploaded by the authenticated user using JWT token and user ID.',
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
            'description': 'ID of the user whose files are being retrieved'
        }
    ],
    'responses': {
        200: {
            'description': 'List of files uploaded by the user',
            'schema': {
                'type': 'object',
                'properties': {
                    'files': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'original_filename': {
                                    'type': 'string',
                                    'description': 'The original name of the uploaded file'
                                },
                                'saved_filename': {
                                    'type': 'string',
                                    'description': 'The unique name the file was saved as on the server'
                                },
                                'path': {
                                    'type': 'string',
                                    'description': 'The file path where the file is stored'
                                },
                                'uploaded_at': {
                                    'type': 'string',
                                    'format': 'date-time',
                                    'description': 'The timestamp of when the file was uploaded'
                                }
                            }
                        }
                    }
                }
            }
        },
        401: {
            'description': 'Unauthorized access, JWT required',
            'examples': {
                'application/json': {
                    'msg': 'Missing Authorization Header'
                }
            }
        },
        404: {
            'description': 'User not found',
            'examples': {
                'application/json': {
                    'error': 'User not found'
                }
            }
        }
    }
})
def get_user_files(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    files = [{'original_filename': file.original_filename, 'saved_filename': file.saved_filename,
              'uploaded_at': file.uploaded_at} for file in user.files]

    return jsonify({'files': files}), 200
