from flask import Blueprint, request, jsonify
from app.services.process_mining_service import alpha_miner_discovery_service, dfg_discovery_service, hurestic_miner_discovery_service, inductive_miner_discovery_service, performance_analysis_service, social_network_service

process_mining_bp = Blueprint('process_mining', __name__)

@process_mining_bp.route('/', methods=['GET'])
def hello_world():
    return 'Hello, World!'

def check_file_presence(request):
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    return file


@process_mining_bp.route('/discover/alpha_miner', methods=['POST'])
def alpha_miner_discovery():
    file = check_file_presence(request)
    if isinstance(file, tuple):
        return file  # Return the error response if the file is missing

    # Call the service for Alpha Miner discovery
    response = alpha_miner_discovery_service(file)
    return response


@process_mining_bp.route('/discover/heuristic_miner', methods=['POST'])
def heuristic_miner_discovery():
    file = check_file_presence(request)
    if isinstance(file, tuple):
        return file

    response = hurestic_miner_discovery_service(file)
    return response


@process_mining_bp.route('/discover/dfg', methods=['POST'])
def discover_dfg_service():
    file = check_file_presence(request)
    if isinstance(file, tuple):
        return file

    response = dfg_discovery_service(file)
    return response

@process_mining_bp.route('/discover/inductive_miner', methods=['POST'])
def discover_inductive_miner():
    file = check_file_presence(request)
    if isinstance(file, tuple):
        return file

    response = inductive_miner_discovery_service(file)
    return response

@process_mining_bp.route('/performance_analysis', methods=['POST'])
def performance_analysis():
    file = check_file_presence(request)
    if isinstance(file, tuple):
        return file
    response = performance_analysis_service(file)
    return response

@process_mining_bp.route('/social_network', methods=['POST'])
def social_network():
    file = check_file_presence(request)
    if isinstance(file, tuple):
        return file
    response = social_network_service(file)
    return response