import base64
import tempfile
import os

import pm4py
from pm4py.objects.log.importer.xes import importer as xes_importer
from pm4py.algo.discovery.alpha import algorithm as alpha_miner
from pm4py.algo.discovery.inductive import algorithm as inductive
from pm4py.algo.discovery.footprints import algorithm as footprints_miner
from pm4py.visualization.petri_net import visualizer as pn_visualizer
from pm4py.visualization.footprints import visualizer as fp_visualizer
import networkx as nx
import pandas as pd
from flask import jsonify
import json
from flask import send_file
from collections import OrderedDict


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
            'label': transition.label if transition.label else transition.name
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
        net, initial_marking, final_marking = pm4py.discover_petri_net_alpha(
            log)
        return jsonify({'net': serialize_petrinet(net), 'im': str(initial_marking), 'fm': str(final_marking)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def heuristic_miner_discovery_service(filepath):
    log = pm4py.read_xes(filepath)

    try:
        # Apply Heuristic Miner
        net, initial_marking, final_marking = pm4py.discover_petri_net_heuristics(
            log)

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
        net, initial_marking, final_marking = pm4py.discover_petri_net_heuristics(
            log)

        return jsonify({'net': serialize_petrinet(net), 'im': str(initial_marking), 'fm': str(final_marking)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def inductive_miner_discovery_service(filepath):
    log = xes_importer.apply(filepath)

    try:
        # Apply Inductive Miner
        net, initial_marking, final_marking = pm4py.discover_petri_net_inductive(
            log)
        return jsonify({'net': serialize_petrinet(net), 'im': str(initial_marking), 'fm': str(final_marking)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def dfg_discovery_service(filepath):
    # Load the log file from the given filepath
    log = xes_importer.apply(filepath)

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
    # Load the log file from the given filepath
    log = xes_importer.apply(filepath)

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


def activity_start_filtering(file_path, filter_set: set, algorithm):
    log = pm4py.read_xes(file_path)
    try:
        filtered_log = pm4py.filter_start_activities(log, filter_set,
                                                     activity_key='concept:name',
                                                     case_id_key='case:concept:name', timestamp_key='time:timestamp')
        net, initial_marking, final_marking = discover_petri_net(
            algorithm, filtered_log)
        # Convert DFG to a serializable format
        return jsonify({
            'net': serialize_petrinet(net),
            'im': str(initial_marking),
            'fm': str(final_marking)
        })
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


def activity_end_filtering(file_path, filter_set: set):

    log = pm4py.read_xes(file_path)
    try:
        filtered_log = pm4py.filter_end_activities(log, filter_set,
                                                   activity_key='concept:name',
                                                   case_id_key='case:concept:name', timestamp_key='time:timestamp')
        dfg, start_activities, end_activities = pm4py.discover_dfg(
            filtered_log)

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
    elif algorithm == 'Inductive Miner':
        return pm4py.discover_petri_net_inductive(log)
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
        net, initial_marking, final_marking = discover_petri_net(
            algorithm, filtered_log)

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
        sorted_df_list = sorted(
            dataframe_list, key=lambda x: len(x.index), reverse=True)

        # Calculate top traces and their percentages
        top_traces = []
        percentages = []
        count = []
        total_instances = sum(len(df.index) for df in dataframe_list)

        for i in range(min(n, len(sorted_df_list))):
            top_traces.append(sorted_df_list[i].iloc[0]['@@variant_column'])
            count.append(len(sorted_df_list[i].index))
            percentages.append(
                round(len(sorted_df_list[i].index) / total_instances * 100, 2))

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
        net, im, fm = pm4py.discover_petri_net_alpha(
            model, activity_key='concept:name', case_id_key='case:concept:name', timestamp_key='time:timestamp')

        alignments_diagnostics = pm4py.conformance_diagnostics_alignments(log, net, im, fm, activity_key='concept:name',
                                                                          case_id_key='case:concept:name',
                                                                          timestamp_key='time:timestamp',
                                                                          return_diagnostics_dataframe=False)
        merged_dict = {i: item for i,
                       item in enumerate(alignments_diagnostics)}
        return jsonify(merged_dict)
    except Exception as e:
        return jsonify({"error": str(e)})


def discover_bpmn(file_path):
    try:
        log = pm4py.read_xes(file_path)
        bpmn = pm4py.discover_bpmn_inductive(log)

        nodes = []
        links = []

        for element in bpmn.get_graph().nodes:
            id = str(element)
            if id.split('@')[1] == '':
                type1 = 'gateway'
                if str(type(element)) == "<class 'pm4py.objects.bpmn.obj.BPMN.ExclusiveGateway'>":
                    text = 'X'
                else:
                    text = '+'
            else:
                type1 = 'node'
                text = (id.split('@'))[1]
            nodes.append({"id": id, "type": type1, "data": text})

        for edge in bpmn.get_graph().edges:
            source, target, data = edge
            links.append({"source": str(source), "target": str(target)})
        return jsonify({'nodes': nodes, 'edges': links})
    except Exception as e:
        return jsonify({"error": str(e)})
    

def getLogSummery(file_path):
    try:
        event_log = pm4py.read_xes(file_path)

        result = pm4py.split_by_process_variant(event_log)
        lst = []
        lst.extend(result)
        dataframe_list = []
        # print(type(lst))
        for key, value in lst:
            dataframe_list.append(value)

        result_dict ={}
        for i in range(len(dataframe_list)):
            
            each_case = dataframe_list[i]['case:concept:name'].unique()
            for j in each_case:
                dict_value = []
                dict_value.append({"variant path": dataframe_list[i].iloc[0]['@@variant_column']})
                dict_value.append({"variant count": len(dataframe_list[i].iloc[0]['@@variant_column'])})
                duration = pm4py.get_case_duration(event_log,j,activity_key='concept:name',case_id_key='case:concept:name',timestamp_key='time:timestamp',business_hours=False)

                days = int(duration // 86400)  
                remaining_seconds = duration % 86400  
                hours = int(remaining_seconds // 3600)  
                minutes = int((remaining_seconds % 3600) // 60)  

                dict_value.append({"Duration": f"{days} day(s), {hours} hour(s), {minutes} minute(s)"})

                result_dict[str(j)] = dict_value

        activities = pm4py.get_event_attribute_values(event_log,'concept:name',case_id_key='case:concept:name')

        d1 = OrderedDict(sorted(result_dict.items()))
        return jsonify({"Case summery": d1, "Variant Frequency":activities})
    except Exception as e:
        return jsonify({"error": str(e)})

    
