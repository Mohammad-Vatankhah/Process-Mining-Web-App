import React, { useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { PetriNet } from "@/types/types";
import ConformanceCheckingTable from "./conformanceCheckingTable";

cytoscape.use(dagre);

const AlignmentGraph = ({
  modelGraph,
  alignmentResults,
}: {
  modelGraph: PetriNet;
  alignmentResults: Record<string, any>;
}) => {
  const [currentTraceIndex, setCurrentTraceIndex] = useState(0);

  const cyRef = useRef<cytoscape.Core | null>(null);

  const traceKeys = Object.keys(alignmentResults);
  const currentTrace = alignmentResults[traceKeys[currentTraceIndex]];

  const elements = React.useMemo(() => {
    const regex =
      /\(\{(?:'[^']*'(?:,\s*)?)+\}(?:,\s*\{(?:'[^']*'(?:,\s*)?)*\})*\)/;
    const initialNodes: string[] = JSON.parse(
      modelGraph.im.replace(/'/g, '"')
    ).map((label: string) => label.split(":")[0]);
    const finalNodes: string[] = JSON.parse(
      modelGraph.fm.replace(/'/g, '"')
    ).map((label: string) => label.split(":")[0]);

    const nodes = [
      ...modelGraph.net.places.map((place) => {
        const circleNode =
          place.label.startsWith("intplace_") ||
          place.label.startsWith("splace_") ||
          place.label.startsWith("pre_") ||
          regex.test(place.label);
        const isStartNode = initialNodes.includes(place.label);
        const isFinalNode = finalNodes.includes(place.label);
        const isNumericalNode = /^\d+$/.test(place.label);
        return {
          data: {
            id: place.id,
            label: isStartNode ? "Start" : isFinalNode ? "End" : place.label,
          },
          classes: isStartNode
            ? "startNode"
            : isFinalNode
            ? "finalNode"
            : circleNode || isNumericalNode
            ? "circleNode"
            : "defaultNode",
        };
      }),
      ...modelGraph.net.transitions.map((transition) => ({
        data: { id: transition.id, label: transition.label },
        classes: transition.label.startsWith("hid_")
          ? "hidNode"
          : "defaultNode",
      })),
    ];

    const edges = modelGraph.net.arcs.map((arc) => ({
      data: {
        id: arc.id,
        source: arc.source,
        target: arc.target,
      },
    }));

    return [...nodes, ...edges];
  }, [modelGraph]);

  const handleNext = () => {
    if (currentTraceIndex < traceKeys.length - 1) {
      setCurrentTraceIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTraceIndex > 0) {
      setCurrentTraceIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.layout({ name: "dagre", rankDir: "LR" }).run();
    }
  }, [elements]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={handlePrevious} disabled={currentTraceIndex === 0}>
          Previous Trace
        </button>
        <span>
          {traceKeys.length > 0
            ? `Trace ${currentTraceIndex + 1} / ${traceKeys.length}`
            : "No alignment data available"}
        </span>
        <button
          onClick={handleNext}
          disabled={
            currentTraceIndex === traceKeys.length - 1 || !traceKeys.length
          }
        >
          Next Trace
        </button>
      </div>
      <CytoscapeComponent
        elements={elements}
        stylesheet={[
          {
            selector: ".circleNode",
            style: {
              width: 80,
              height: 80,
              "background-color": "#ccc",
              border: "1px solid rgba(0, 0, 0)",
              "text-valign": "center",
              "text-halign": "center",
            },
          },
          {
            selector: ".hidNode",
            style: {
              width: "100px",
              height: "50px",
              "background-color": "black",
              shape: "rectangle",
              color: "transparent",
            },
          },
          {
            selector: ".defaultNode",
            style: {
              label: "data(label)",
              width: "label",
              height: 40,
              "background-color": "#ccc",
              "text-valign": "center",
              "text-halign": "center",
              shape: "round-rectangle",
              padding: "10px",
            },
          },
          {
            selector: ".startNode",
            style: {
              width: 80,
              height: 80,
              "background-color": "green",
              border: "1px solid rgba(0, 0, 0)",
              "text-valign": "center",
              "text-halign": "center",
              label: "data(label)",
              color: "white",
            },
          },
          {
            selector: ".finalNode",
            style: {
              width: 80,
              height: 80,
              "background-color": "red",
              border: "1px solid rgba(0, 0, 0)",
              "text-valign": "center",
              "text-halign": "center",
              label: "data(label)",
              color: "white",
            },
          },
          {
            selector: ".fitEdge",
            style: {
              "line-color": "green",
              width: 3,
            },
          },
          {
            selector: ".mismatchEdge",
            style: {
              "line-color": "red",
              width: 3,
            },
          },
          {
            selector: "edge",
            style: {
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              width: 2,
            },
          },
        ]}
        style={{ width: "100%", height: "250px", backgroundColor: "white" }}
        cy={(cy) => (cyRef.current = cy)}
      />
      <ConformanceCheckingTable alignments={alignmentResults} />
    </div>
  );
};

export default AlignmentGraph;
