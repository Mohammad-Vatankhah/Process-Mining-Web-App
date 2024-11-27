import base64
import tempfile
import os

import pm4py
from pm4py.objects.log.importer.xes import importer as xes_importer
from pm4py.algo.discovery.alpha import algorithm as alpha_miner
from pm4py.algo.discovery.footprints import algorithm as footprints_miner
from pm4py.visualization.petri_net import visualizer as pn_visualizer
from pm4py.visualization.footprints import visualizer as fp_visualizer
import networkx as nx
import pandas as pd
from flask import jsonify
import pm4py

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

def serialize_petrinet(net):
    # Create a structure for the Petri net
    petrinet_data = {
        'places': [],
        'arcs': [],
        'transitions': []
    }

    # Serialize places
    for place in net.places:
        petrinet_data['places'].append({
            'id': str(place),  # Use the place's unique identifier
            'label': place.name if place.name else 'Place'
        })

    # Serialize transitions
    for transition in net.transitions:
        petrinet_data['transitions'].append({
            'id': str(transition),  # Use the transition's unique identifier
            'label': transition.name if transition.name else 'Transition'
        })

    # Serialize edges
    for arc in net.arcs:
        petrinet_data['arcs'].append({
            'id': f"{arc.source}-{arc.target}",  # Unique edge ID
            'source': str(arc.source),  # Source place/transition
            'target': str(arc.target),  # Target place/transition
        })

    return petrinet_data

def alpha_miner_discovery_service(filepath):
    log = xes_importer.apply(filepath)

    try:
        # Apply Alpha Miner algorithm
        net, initial_marking, final_marking = pm4py.discover_petri_net_alpha(log)
        return jsonify({'net': serialize_petrinet(net), 'im': str(initial_marking), 'fm': str(final_marking)})
    except Exception as e:
        return jsonify({"error": str(e)})

def heuristic_miner_discovery_service(filepath):
    log = pm4py.read_xes(filepath)

    try:
        # Apply Heuristic Miner
        net, initial_marking, final_marking = pm4py.discover_petri_net_heuristics(log)

        return jsonify({'net': serialize_petrinet(net), 'im': str(initial_marking), 'fm': str(final_marking)})

    except Exception as e:
        return jsonify({"error": str(e)})

def inductive_miner_discovery_service(filepath):
    log = xes_importer.apply(filepath)

    try:
        # Apply Inductive Miner
        net, initial_marking, final_marking = alpha_miner.apply(log)
        print(net)
        # return jsonify({'net': serialize_petrinet(net), 'im': str(initial_marking), 'fm': str(final_marking)})
        return 200

    except Exception as e:
        return jsonify({"error": str(e)})

def dfg_discovery_service(filepath):
    log = xes_importer.apply(filepath)  # Load the log file from the given filepath

    try:
        # Discover Directly-Follows Graph (DFG)
        # dfg = dfg_factory.apply(log)
        dfg, start_activities, end_activities = pm4py.discover_dfg(log)

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
    log = pm4py.read_xes(filepath)
    try:
        footprints = footprints_miner.apply(log)
        response = fp_visualizer.apply(footprints)
        # pm4py.view_footprints(footprints, format='svg')
        return jsonify({'footprint': str(response)})
    except Exception as e:
        return jsonify({"error": str(e)})
    
def get_start_activity_attribute(file_path):
    log = pm4py.read_xes(file_path)
    try:
        response = pm4py.get_start_activities(log, case_id_key='case:concept:name',
                                      activity_key='concept:name',
                                      timestamp_key='time:timestamp')
        return jsonify({'Start Activity': response})
    except Exception as e:
        return jsonify({"error": str(e)})
    
def activity_start_filtering(file_path,filter_set: set):
    log = pm4py.read_xes(file_path)
    try:
        filtered_log = pm4py.filter_start_activities(log, filter_set,
                                                       activity_key='concept:name',
                                                       case_id_key='case:concept:name', timestamp_key='time:timestamp')
        dfg, start_activities, end_activities = pm4py.discover_dfg(filtered_log)

        # Convert DFG to a serializable format
        dfg_serializable = {str(k): v for k, v in dfg.items()}
        return jsonify({'dfg': dfg_serializable})
    except Exception as e:
        return jsonify({"error": str(e)})

def get_end_activity_attribute(file_path):
    log = pm4py.read_xes(file_path)
    try:
        response = pm4py.get_end_activities(log, case_id_key='case:concept:name',
                                      activity_key='concept:name',
                                      timestamp_key='time:timestamp')
        return jsonify({'End Activity': response})
    except Exception as e:
        return jsonify({"error": str(e)})

def activity_end_filtering(file_path,filter_set: set):
    
    log = pm4py.read_xes(file_path)
    try:
        filtered_log = pm4py.filter_end_activities(log, filter_set,
                                                       activity_key='concept:name',
                                                       case_id_key='case:concept:name', timestamp_key='time:timestamp')
        dfg, start_activities, end_activities = pm4py.discover_dfg(filtered_log)

        # Convert DFG to a serializable format
        dfg_serializable = {str(k): v for k, v in dfg.items()}
        return jsonify({'dfg': dfg_serializable})
    except Exception as e:
        return jsonify({"error": str(e)})
    
def get_all_activity_attribute():
    file_path = r"Backend\PM-API\Dataset\running-example-exported.xes"
    log = pm4py.read_xes(file_path)
    try:
        responses = pm4py.get_event_attribute_values(log, case_id_key='case:concept:name', attribute='concept:name',
                                            count_once_per_case=False)
        
        return jsonify({'All attribute': str(responses)})
    except Exception as e:
        return jsonify({"error": str(e)})
    
def attributes_filtering(file_path,filter_set: set):
    log = pm4py.read_xes(file_path)
    try:
        filtered_log = pm4py.filter_event_attribute_values(log, 'concept:name',filter_set,
                                                       case_id_key='case:concept:name')
        dfg, start_activities, end_activities = pm4py.discover_dfg(filtered_log)

        # Convert DFG to a serializable format
        dfg_serializable = {str(k): v for k, v in dfg.items()}
        return jsonify({'dfg': dfg_serializable})
    except Exception as e:
        return jsonify({"error": str(e)})
    
def get_top_stats(file_path,n=5):
    log = pm4py.read_xes(file_path)
    try:
        all_stats =  pm4py.split_by_process_variant(log)
        all_stats_list = []
        all_stats_list.extend(all_stats)
        dataframe_list = []

        for key, value in all_stats_list:
            dataframe_list.append(value)

        sorteddflist= sorted(dataframe_list,key=lambda x:len(x.index),reverse=True)
        response = []
        for i in range(0,n):
          response.append(sorteddflist[i].iloc[0]['@@variant_column'])

        return jsonify({'dfg': str(response)})
    except Exception as e:
        return jsonify({"error": str(e)})
