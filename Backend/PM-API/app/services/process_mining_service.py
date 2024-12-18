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
import json
from flask import send_file

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
        return jsonify({"error": str(e)}), 500

def heuristic_miner_discovery_service(filepath):
    log = pm4py.read_xes(filepath)

    try:
        # Apply Heuristic Miner
        net, initial_marking, final_marking = pm4py.discover_petri_net_heuristics(log)

        return jsonify({'net': serialize_petrinet(net), 'im': str(initial_marking), 'fm': str(final_marking)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def ilp_miner_discovery_service(filepath):
    log = xes_importer.apply(filepath)

    try:
        # Apply Alpha Miner algorithm
        net, initial_marking, final_marking = pm4py.discover_petri_net_ilp(log)
        return jsonify({'net': serialize_petrinet(net), 'im': str(initial_marking), 'fm': str(final_marking)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def heuristic_miner_discovery_service(filepath):
    log = pm4py.read_xes(filepath)

    try:
        # Apply Heuristic Miner
        net, initial_marking, final_marking = pm4py.discover_petri_net_heuristics(log)

        return jsonify({'net': serialize_petrinet(net), 'im': str(initial_marking), 'fm': str(final_marking)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def inductive_miner_discovery_service(filepath):
    log = xes_importer.apply(filepath)

    try:
        # Apply Inductive Miner
        net, initial_marking, final_marking = alpha_miner.apply(log)
        print(net)
        # return jsonify({'net': serialize_petrinet(net), 'im': str(initial_marking), 'fm': str(final_marking)})
        return 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        return jsonify({"error": str(e)}), 500

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
        return jsonify({"error": str(e)}), 500

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
        return jsonify({"error": str(e)}), 500

def footprint_discover(filepath):
    log = pm4py.read_xes(filepath)
    try:
        footprints = footprints_miner.apply(log)
        response = fp_visualizer.apply(footprints)
        # pm4py.view_footprints(footprints, format='svg')
        return jsonify({'footprint': str(response)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_start_activity_attribute(file_path):
    log = pm4py.read_xes(file_path)
    try:
        response = pm4py.get_start_activities(log, case_id_key='case:concept:name',
                                      activity_key='concept:name',
                                      timestamp_key='time:timestamp')
        return jsonify({'Start Activity': response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        return jsonify({"error": str(e)}), 500

def get_end_activity_attribute(file_path):
    log = pm4py.read_xes(file_path)
    try:
        response = pm4py.get_end_activities(log, case_id_key='case:concept:name',
                                      activity_key='concept:name',
                                      timestamp_key='time:timestamp')
        return jsonify({'End Activity': response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        return jsonify({"error": str(e)}), 500

def get_all_activity_attribute(file_path):
    log = pm4py.read_xes(file_path)
    try:
        responses = pm4py.get_event_attribute_values(log, case_id_key='case:concept:name', attribute='concept:name',
                                            count_once_per_case=False)
        
        return jsonify({'All attribute': str(responses)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from flask import jsonify
import pm4py

def discover_petri_net(algorithm, log):
    """
    Discovers a Petri net using the specified algorithm.
    
    :param algorithm: The discovery algorithm to use ('alphaMiner' or 'heuristicMiner').
    :param log: The event log to process.
    :return: A tuple containing the Petri net, initial marking, and final marking.
    """
    if algorithm == 'Alpha Miner':
        return pm4py.discover_petri_net_alpha(log)
    elif algorithm == 'Heuristic Miner':
        return pm4py.discover_petri_net_heuristics(log)
    elif algorithm == "ILP Miner":
        return pm4py.discover_petri_net_ilp(log)
    else:
        raise ValueError('Invalid Algorithm')

def attributes_filtering(file_path, filter_set: set, algorithm):
    """
    Filters an event log based on the specified attributes and discovers a Petri net.
    
    :param file_path: The path to the XES file.
    :param filter_set: A set of attribute values to filter.
    :param algorithm: The discovery algorithm to use ('alphaMiner' or 'heuristicMiner').
    :return: A JSON response with the discovered Petri net or an error message.
    """
    try:
        # Read the log file
        log = pm4py.read_xes(file_path)

        # Filter the event log based on attribute values
        filtered_log = pm4py.filter_event_attribute_values(
            log, 
            attribute_key='concept:name', 
            values=filter_set,
            case_id_key='case:concept:name'
        )

        # Discover the Petri net
        net, initial_marking, final_marking = discover_petri_net(algorithm, filtered_log)

        # Return the serialized Petri net
        return jsonify({
            'net': serialize_petrinet(net),
            'im': str(initial_marking),
            'fm': str(final_marking)
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_top_stats(file_path, n=5):
    log = pm4py.read_xes(file_path)
    try:
        # Split log into process variants
        all_stats = pm4py.split_by_process_variant(log)
        all_stats_list = []
        all_stats_list.extend(all_stats)
        dataframe_list = []

        for key, value in all_stats_list:
            dataframe_list.append(value)

        # Sort dataframes by the number of instances in descending order
        sorted_df_list = sorted(dataframe_list, key=lambda x: len(x.index), reverse=True)

        # Calculate top traces and their percentages
        top_traces = []
        percentages = []
        count = []
        total_instances = sum(len(df.index) for df in dataframe_list)

        for i in range(min(n, len(sorted_df_list))):
            top_traces.append(sorted_df_list[i].iloc[0]['@@variant_column'])
            count.append(len(sorted_df_list[i].index))
            percentages.append(round(len(sorted_df_list[i].index) / total_instances * 100, 2))

        # Calculate the number of unique traces
        unique_traces_count = len(all_stats_list)

        return jsonify({
            'top_traces': top_traces,
            'percentages': percentages,
            'unique_traces': unique_traces_count,
            'count': count
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def conformance_checking(model_log_file_path, test_log_file_path):
    model = pm4py.read_xes(model_log_file_path)
    log = pm4py.read_xes(test_log_file_path)
    try:
        net, im, fm = pm4py.discover_petri_net_alpha(model, activity_key='concept:name', case_id_key='case:concept:name', timestamp_key='time:timestamp')

        alignments_diagnostics = pm4py.conformance_diagnostics_alignments(log, net, im, fm, activity_key='concept:name',
                                                                        case_id_key='case:concept:name',
                                                                        timestamp_key='time:timestamp',
                                                                        return_diagnostics_dataframe=False)
        merged_dict = {i: item for i, item in enumerate(alignments_diagnostics)}
        return jsonify(merged_dict)
    except Exception as e:
        return jsonify({"error": str(e)})
    
def read_bpmn_file(file_path):
    bpmn_graph = pm4py.read_bpmn(file_path)
    try:
        pm4py.view_bpmn(bpmn_graph)
        return jsonify("Suecces")
    except Exception as e:
        return jsonify({"error": str(e)})
    
def export_as_bpmn(file_path):
    try:
        event_log = pm4py.read_xes(file_path)
        bpmn_graph = pm4py.discover_bpmn_inductive(event_log, activity_key='concept:name', case_id_key='case:concept:name', timestamp_key='time:timestamp')
        output_path = r'Backend\Dataset\bpmn\discovered_model.bpmn'
        pm4py.write_bpmn(bpmn_graph, output_path,auto_layout=True)
        return send_file(output_path, as_attachment=True, mimetype='application/xml')
        # return jsonify(str(bpmn_graph))
    except Exception as e:
        return jsonify({"error": str(e)})
    

def dfg_reader(file_path):
    try:
        dfg_model = pm4py.read_dfg(file_path)
        dfg = dfg_model[0]
        start_activities = dfg_model[1]
        end_activities = dfg_model[2]
        pm4py.view_dfg(dfg, start_activities, end_activities, format='svg')
        dfg_serializable = {str(k): v for k, v in dfg.items()}
        return jsonify({'dfg':dfg_serializable})
    except Exception as e:
        return jsonify({"error": str(e)})
    
def export_as_dfg(file_path):
    try:
        event_log = pm4py.read_xes(file_path)
        dfg, start_activities, end_activities = pm4py.discover_dfg(event_log)
        # result = dfg.update(start_activities.update(end_activities))

        dfg_serializable = {str(k): v for k, v in dfg.items()}
        start_activities_serializable = {str(k): v for k, v in start_activities.items()}
        end_activities_serializable = {str(k): v for k, v in end_activities.items()}
        print("log")
        return jsonify({'start_activities':start_activities_serializable ,'end_activities': end_activities_serializable, 'dfg':dfg_serializable })
    except Exception as e:
        return jsonify({"error": str(e)})