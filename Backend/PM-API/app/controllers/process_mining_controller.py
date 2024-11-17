from flask import Blueprint, request, jsonify
from flasgger import swag_from
from app.services.process_mining_service import (alpha_miner_discovery_service,
                                                 dfg_discovery_service,
                                                 heuristic_miner_discovery_service,
                                                 inductive_miner_discovery_service,
                                                 performance_analysis_service,
                                                 social_network_service,footprint_discover,
                                                 get_start_activity_attribute,
                                                 get_end_activity_attribute,
                                                 activity_start_filtering,
                                                 activity_end_filtering)
import os
import uuid
from werkzeug.utils import secure_filename
from app import db
from app.models.user import User, File
from flask_jwt_extended import get_jwt_identity, jwt_required

process_mining_bp = Blueprint('process_mining', __name__)

UPLOAD_FOLDER = 'uploads/'


def get_file_path(filename):
    file_path = os.path.join(UPLOAD_FOLDER, secure_filename(filename))
    if not os.path.exists(file_path):
        return None
    return file_path


@process_mining_bp.route('/upload', methods=['POST'])
@jwt_required(optional=True)
@swag_from({
    'tags': ['PM'],
    'summary': 'Upload a file',
    'consumes': ['multipart/form-data'],
    'parameters': [
        {
            'name': 'file',
            'in': 'formData',
            'type': 'file',
            'required': True,
            'description': 'File to be uploaded'
        }
    ],
    'responses': {
        201: {
            'description': 'File uploaded successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'msg': {'type': 'string', 'example': 'File uploaded successfully'},
                    'filename': {'type': 'string', 'example': 'unique-file-name.xes'},
                    'path': {'type': 'string', 'example': 'path/to/saved/file.xes'}
                }
            }
        },
        400: {
            'description': 'Bad Request: No file part or no selected file'
        },
        404: {
            'description': 'User not found'
        }
    }
})
def upload_file():
    # Get the user ID from the JWT token
    current_user_id = get_jwt_identity()
    user = None

    if current_user_id:
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Ensure the upload folder exists
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    # Save the file with a unique UUID to ensure uniqueness across the system
    original_filename = secure_filename(file.filename)
    unique_saved_filename = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
    file_path = os.path.join(UPLOAD_FOLDER, secure_filename(unique_saved_filename))
    file.save(file_path)

    # If a user is logged in, save the file record to the database
    if user:
        # Check for duplicate filenames for the user (for future use if needed)
        saved_filename = original_filename
        count = 1

        while File.query.filter_by(user_id=user.id, original_filename=saved_filename).first():
            saved_filename = f"{os.path.splitext(original_filename)[0]}_{count}{os.path.splitext(original_filename)[1]}"
            count += 1

        # Create a new File record in the database
        new_file = File(
            user_id=user.id,
            original_filename=original_filename,
            saved_filename=unique_saved_filename,  # Use the unique saved filename
            upload_path=file_path
        )
        db.session.add(new_file)
        db.session.commit()

    return jsonify({
        'msg': 'File uploaded successfully',
        'filename': unique_saved_filename,  # Return the unique filename used for storage
    }), 201


@process_mining_bp.route('/discover/alpha_miner/<filename>', methods=['GET'])
@swag_from({
    'tags': ['PM'],
    'summary': 'Discover process using Alpha Miner',
    'parameters': [
        {
            'name': 'filename',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'The file name of the uploaded file'
        }
    ],
    'responses': {
        200: {
            'description': 'Alpha Miner discovery result',
        },
        404: {
            'description': 'File not found'
        }
    }
})
def alpha_miner_discovery(filename):
    file_path = get_file_path(filename)
    if file_path is None:
        return jsonify({'msg': 'File not found'}), 404

    response = alpha_miner_discovery_service(file_path)
    return response


@process_mining_bp.route('/discover/heuristic_miner/<filename>', methods=['GET'])
@swag_from({
    'tags': ['PM'],
    'summary': 'Discover process using Heuristic Miner',
    'parameters': [
        {
            'name': 'filename',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'The file name of the uploaded file'
        }
    ],
    'responses': {
        200: {
            'description': 'Heuristic Miner discovery result',
        },
        404: {
            'description': 'File not found'
        }
    }
})
def heuristic_miner_discovery(filename):
    file_path = get_file_path(filename)
    if file_path is None:
        return jsonify({'msg': 'File not found'}), 404

    response = heuristic_miner_discovery_service(file_path)
    return response


@process_mining_bp.route('/discover/dfg/<filename>', methods=['GET'])
@swag_from({
    'tags': ['PM'],
    'summary': 'Discover process using Directly-Follows Graph (DFG)',
    'parameters': [
        {
            'name': 'filename',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'The file name of the uploaded file'
        }
    ],
    'responses': {
        200: {
            'description': 'DFG discovery result',
        },
        404: {
            'description': 'File not found'
        }
    }
})
def discover_dfg_service(filename):
    file_path = get_file_path(filename)
    if file_path is None:
        return jsonify({'msg': 'File not found'}), 404

    response = dfg_discovery_service(file_path)
    return response


@process_mining_bp.route('/discover/inductive_miner/<filename>', methods=['GET'])
@swag_from({
    'tags': ['PM'],
    'summary': 'Discover process using Inductive Miner',
    'parameters': [
        {
            'name': 'filename',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'The file name of the uploaded file'
        }
    ],
    'responses': {
        200: {
            'description': 'Inductive Miner discovery result',
        },
        404: {
            'description': 'File not found'
        }
    }
})
def discover_inductive_miner(filename):
    file_path = get_file_path(filename)
    if file_path is None:
        return jsonify({'msg': 'File not found'}), 404

    response = inductive_miner_discovery_service(file_path)
    return response


@process_mining_bp.route('/performance_analysis/<filename>', methods=['GET'])
@swag_from({
    'tags': ['PM'],
    'summary': 'Analyze process performance',
    'parameters': [
        {
            'name': 'filename',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'The file name of the uploaded file'
        }
    ],
    'responses': {
        200: {
            'description': 'Performance analysis result',
        },
        404: {
            'description': 'File not found'
        }
    }
})
def performance_analysis(filename):
    file_path = get_file_path(filename)
    if file_path is None:
        return jsonify({'msg': 'File not found'}), 404

    response = performance_analysis_service(file_path)
    return response


@process_mining_bp.route('/social_network/<filename>', methods=['GET'])
@swag_from({
    'tags': ['PM'],
    'summary': 'Generate social network mining',
    'parameters': [
        {
            'name': 'filename',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'The file name of the uploaded file'
        }
    ],
    'responses': {
        200: {
            'description': 'Social network mining result',
        },
        404: {
            'description': 'File not found'
        }
    }
})
def social_network(filename):
    file_path = get_file_path(filename)
    if file_path is None:
        return jsonify({'msg': 'File not found'}), 404

    response = social_network_service(file_path)
    return response


@process_mining_bp.route('/discover/footprint/<filename>')
@swag_from({
    'tags': ['PM'],
    'summary': 'Discover footprint',
    'parameters': [
        {
            'name': 'filename',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'The file name of the uploaded file'
        }
    ],
    'responses': {
        200: {
            'description': 'footprint result',
        },
        404: {
            'description': 'File not found'
        }
    }
})
def footprint(filename):
    file_path = get_file_path(filename)
    if file_path is None:
        return jsonify({'msg': 'File not found'}), 404
    response = footprint_discover(file_path)
    return response

@process_mining_bp.route('/discover/filter')
def filter_events():
   my_set = ['']
   
   response = activity_start_filtering(my_set)
   
   return response