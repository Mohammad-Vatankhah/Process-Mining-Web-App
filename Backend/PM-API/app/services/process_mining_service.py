import base64
import tempfile
import os

import pm4py
from pm4py.objects.log.importer.xes import importer as xes_importer
from pm4py.algo.discovery.alpha import algorithm as alpha_miner
from pm4py.algo.discovery.heuristics import algorithm as heuristics_miner
from pm4py.algo.discovery.inductive import algorithm as inductive_miner
from pm4py.algo.discovery.dfg import algorithm as dfg_factory
from pm4py.algo.discovery.footprints import algorithm as footprints_miner
from pm4py.visualization.petri_net import visualizer as pn_visualizer
from pm4py.visualization.footprints import visualizer as fp_visualizer
from pm4py.objects.conversion.process_tree import converter as pt_converter
import networkx as nx
import pandas as pd
from flask import jsonify


def encode_image_to_base64(gviz):
    """Encode the generated visualization to base64"""
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_img:
        pn_visualizer.save(gviz, temp_img.name)  # Save to a temp file
        temp_img.seek(0)  # Go to the start of the file

        # Read the temp file and convert to base64
        with open(temp_img.name, "rb") as img_file:
            img_base64 = base64.b64encode(img_file.read()).decode('utf-8')

    os.remove(temp_img.name)  # Remove the temp file after reading it
    return img_base64


def alpha_miner_discovery_service(filepath):
    log = xes_importer.apply(filepath)

    try:
        # Apply Alpha Miner algorithm
        net, initial_marking, final_marking = alpha_miner.apply(log)

        # Visualize the Petri net
        gviz = pn_visualizer.apply(net, initial_marking, final_marking)

        # Return the image as base64 string
        img_base64 = encode_image_to_base64(gviz)
        return jsonify({'image_base64': f'data:image/png;base64,{img_base64}'})
    except Exception as e:
        return jsonify({"error": str(e)})


def heuristic_miner_discovery_service(filepath):
    log = xes_importer.apply(filepath)

    try:
        # Apply Heuristic Miner
        net, initial_marking, final_marking = heuristics_miner.apply(log)

        # Visualize the Petri net
        gviz = pn_visualizer.apply(net, initial_marking, final_marking)

        # Return the image as base64 string
        img_base64 = encode_image_to_base64(gviz)
        return jsonify({'image_base64': f'data:image/png;base64,{img_base64}'})
    except Exception as e:
        return jsonify({"error": str(e)})


def inductive_miner_discovery_service(filepath):
    log = xes_importer.apply(filepath)

    try:
        # Apply Inductive Miner
        process_tree = inductive_miner.apply(log)
        net, initial_marking, final_marking = pt_converter.apply(process_tree)

        # Visualize the Petri net
        gviz = pn_visualizer.apply(net, initial_marking, final_marking)

        # Return the image as base64 string
        img_base64 = encode_image_to_base64(gviz)
        return jsonify({'image_base64': f'data:image/png;base64,{img_base64}'})
    except Exception as e:
        return jsonify({"error": str(e)})


def dfg_discovery_service(filepath):
    log = xes_importer.apply(filepath)  # Load the log file from the given filepath

    try:
        # Discover Directly-Follows Graph (DFG)
        dfg = dfg_factory.apply(log)

        # Convert DFG to a serializable format
        dfg_serializable = {str(k): v for k, v in dfg.items()}

        return jsonify({'dfg': dfg_serializable})
    except Exception as e:
        return jsonify({"error": str(e)})


def performance_analysis_service(filepath):
    log = xes_importer.apply(filepath)  # Load the log file from the given filepath

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
    except Exception as e:
        return jsonify({"error": str(e)})


def social_network_service(filepath):
    log = xes_importer.apply(filepath)  # Load the log file from the given filepath

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
    except Exception as e:
        return jsonify({"error": str(e)})


def footprint_discover(filepath):
    log = xes_importer.apply(filepath)
    try:
        footprints = footprints_miner.apply(log)
        response = fp_visualizer.apply(footprints)
        # pm4py.view_footprints(footprints, format='svg')
        return jsonify({'footprint': str(response)})
    except Exception as e:
        return jsonify({"error": str(e)})