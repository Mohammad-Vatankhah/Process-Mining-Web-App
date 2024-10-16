import os
import tempfile
from pm4py.objects.log.importer.xes import importer as xes_importer
from pm4py.algo.discovery.alpha import algorithm as alpha_miner
from pm4py.algo.discovery.heuristics import algorithm as heuristics_miner
from pm4py.algo.discovery.inductive import algorithm as inductive_miner
from pm4py.algo.discovery.dfg import algorithm as dfg_factory
from pm4py.visualization.petri_net import visualizer as pn_visualizer
from pm4py.objects.conversion.process_tree import converter as pt_converter
import networkx as nx
import pandas as pd
from flask import send_file, jsonify

def alpha_miner_discovery_service(file):
    # Save the uploaded file to a temporary file
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file.save(temp_file.name)
        log = xes_importer.apply(temp_file.name)

    try:
        # Apply Alpha Miner algorithm to discover the process model
        net, initial_marking, final_marking = alpha_miner.apply(log)

        # Visualize the Petri net and save the result as an image
        gviz = pn_visualizer.apply(net, initial_marking, final_marking)
        temp_img = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
        pn_visualizer.save(gviz, temp_img.name)

        # Return the image as a response and clean up after sending
        response = send_file(temp_img.name, mimetype='image/png')
        response.call_on_close(lambda: os.remove(temp_img.name))
        return response
    finally:
        os.remove(temp_file.name)  # Clean up the log file

def hurestic_miner_discovery_service(file):
    # Save and load log file
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file.save(temp_file.name)
        log = xes_importer.apply(temp_file.name)

    try:
        # Apply Heuristic Miner
        net, initial_marking, final_marking = heuristics_miner.apply(log)

        # Visualize and save the model
        gviz = pn_visualizer.apply(net, initial_marking, final_marking)
        temp_img = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
        pn_visualizer.save(gviz, temp_img.name)

        response = send_file(temp_img.name, mimetype='image/png')
        response.call_on_close(lambda: os.remove(temp_img.name))  # Deleting image after response is sent

        return response
    finally:
        os.remove(temp_file.name)  # Ensure the log file is removed

def inductive_miner_discovery_service(file):
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file.save(temp_file.name)
        log = xes_importer.apply(temp_file.name)

    try:
        # Apply Inductive Miner
        process_tree = inductive_miner.apply(log)
        net, initial_marking, final_marking = pt_converter.apply(process_tree)

        # Visualize and save the model
        gviz = pn_visualizer.apply(net, initial_marking, final_marking)
        temp_img = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
        pn_visualizer.save(gviz, temp_img.name)

        response = send_file(temp_img.name, mimetype='image/png')
        response.call_on_close(lambda: os.remove(temp_img.name))  # Deleting image after response is sent
        return response
    finally:
        os.remove(temp_file.name)

def dfg_discovery_service(file):
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file.save(temp_file.name)
        log = xes_importer.apply(temp_file.name)

    try:
        # Discover Directly-Follows Graph (DFG)
        dfg = dfg_factory.apply(log)
        
        # Convert DFG to a serializable format
        dfg_serializable = {str(k): v for k, v in dfg.items()}

        return jsonify({'dfg': dfg_serializable})

    finally:
        os.remove(temp_file.name)

def performance_analysis_service(file):
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file.save(temp_file.name)
        log = xes_importer.apply(temp_file.name)

    try:
        data = []
        for trace in log:
            for event in trace:
                data.append({
                    'case_id': trace.attributes['concept:name'],
                    'event_name': event['concept:name'],
                    'timestamp': event['time:timestamp']
                })
        
        df = pd.DataFrame(data)
        
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['duration'] = df['timestamp'].diff().dt.total_seconds()
        avg_duration = df['duration'].mean()

        return jsonify({'average_duration': avg_duration})

    finally:
        os.remove(temp_file.name)

def social_network_service(file):
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file.save(temp_file.name)
        log = xes_importer.apply(temp_file.name)

    try:
        # Create a DataFrame from the event log
        data = []
        for trace in log:
            for event in trace:
                data.append({
                    'case_id': trace.attributes['concept:name'],
                    'event_name': event['concept:name'],
                })
        
        df = pd.DataFrame(data)
        
        # Create a graph of activities
        G = nx.Graph()
        
        # Add edges based on co-occurrence
        for _, group in df.groupby('case_id'):
            activities = group['event_name'].tolist()
            for i in range(len(activities)):
                for j in range(i + 1, len(activities)):
                    G.add_edge(activities[i], activities[j])

        # Serialize the graph to return it
        social_network_data = nx.to_dict_of_lists(G)
        
        return jsonify({'social_network': social_network_data})

    finally:
        os.remove(temp_file.name)
