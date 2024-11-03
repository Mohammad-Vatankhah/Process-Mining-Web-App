"use client";

import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

type Arc = {
  id: string;
  source: string;
  target: string;
};

type Place = {
  id: string;
  label: string;
};

type Transition = {
  id: string;
  label: string;
};

type PetriNetGraphProps = {
  arcs: Arc[];
  places: Place[];
  transitions: Transition[];
};

type PetriNet = {
  net: PetriNetGraphProps;
  fm: string;
  im: string;
};

const PetriNetGraph: React.FC<{ petrinet: PetriNet }> = ({ petrinet }) => {
  const initialNodes: Node[] = useMemo(() => {
    const nodesList: Node[] = [];
    const initialNodes: [string] = JSON.parse(petrinet.im.replace(/'/g, '"'));
    const finalNodes: [string] = JSON.parse(petrinet.fm.replace(/'/g, '"'));
    petrinet.net.places.map((place) => {
      const isStart = initialNodes.includes(place.label);
      const isEnd = finalNodes.includes(place.label);
      nodesList.push({
        id: place.id,
        data: {
          label: isStart ? "Start" : isEnd ? "End" : place.label,
        },
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        sourcePosition: isStart ? Position.Right : undefined,
        targetPosition: isEnd ? Position.Left : undefined,
        style:
          place.label.startsWith("intplace_") ||
          (place.label.startsWith("splace_") && {
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "transparent",
          }),
      });
    });

    petrinet.net.transitions.map((transition) => {
      nodesList.push({
        id: transition.id,
        data: { label: transition.label },
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        style: transition.label.startsWith("hid_") && {
          background: "black",
          width: "100px",
          height: "50px",
          padding: 10,
          color: "transparent",
        },
      });
    });
    return nodesList;
  }, [petrinet]);

  const initialEdges: Edge[] = useMemo(() => {
    return petrinet.net.arcs.map((arc) => ({
      id: arc.id,
      source: arc.source,
      target: arc.target,
      markerEnd: {
        type: MarkerType.Arrow,
      },
    }));
  }, [petrinet]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default PetriNetGraph;
