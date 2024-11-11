"use client";

import React, { useEffect, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import klay from "cytoscape-klay";
import cytoscape from "cytoscape";
import { Card, CardContent, CardHeader, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

cytoscape.use(klay);

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

const circleNodeStyle = {
  width: 80,
  height: 80,
  "background-color": "#ccc",
  border: "1px solid rgba(0, 0, 0)",
  "text-valign": "center",
  "text-halign": "center",
};

const startNodeStyle = {
  width: 80,
  height: 80,
  "background-color": "green",
  border: "1px solid rgba(0, 0, 0)",
  "text-valign": "center",
  "text-halign": "center",
  label: "data(label)",
  color: "white",
};

const finalNodeStyle = {
  width: 80,
  height: 80,
  "background-color": "red",
  border: "1px solid rgba(0, 0, 0)",
  "text-valign": "center",
  "text-halign": "center",
  label: "data(label)",
  color: "white",
};

const hidNodeStyle = {
  width: "100px",
  height: "50px",
  "background-color": "black",
  shape: "rectangle",
  color: "transparent",
};

const defaultNodeStyle = {
  label: "data(label)",
  width: 200,
  height: 40,
  "background-color": "#ccc",
  "text-valign": "center",
  "text-halign": "center",
  shape: "rectangle",
};

const PetriNetGraph: React.FC<{ petrinet: PetriNet; algorithm: string }> = ({
  petrinet,
  algorithm,
}) => {
  const cyRef = useRef<cytoscape.Core | null>(null);

  const elements = React.useMemo(() => {
    const regex =
      /\(\{(?:'[^']*'(?:,\s*)?)+\}(?:,\s*\{(?:'[^']*'(?:,\s*)?)*\})*\)/;
    const initialNodes: string[] = JSON.parse(
      petrinet.im.replace(/'/g, '"')
    ).map((label: string) => label.split(":")[0]);
    const finalNodes: string[] = JSON.parse(petrinet.fm.replace(/'/g, '"')).map(
      (label: string) => label.split(":")[0]
    );

    const nodes = [
      ...petrinet.net.places.map((place) => {
        const circleNode =
          place.label.startsWith("intplace_") ||
          place.label.startsWith("splace_") ||
          place.label.startsWith("pre_") ||
          regex.test(place.label);
        const isStartNode = initialNodes.includes(place.label);
        const isFinalNode = finalNodes.includes(place.label);
        return {
          data: {
            id: place.id,
            label: isStartNode ? "Start" : isFinalNode ? "End" : place.label,
          },
          classes: isStartNode
            ? "startNode"
            : isFinalNode
            ? "finalNode"
            : circleNode
            ? "circleNode"
            : "defaultNode",
        };
      }),
      ...petrinet.net.transitions.map((transition) => ({
        data: { id: transition.id, label: transition.label },
        classes: transition.label.startsWith("hid_")
          ? "hidNode"
          : "defaultNode",
      })),
    ];

    const edges = petrinet.net.arcs.map((arc) => ({
      data: {
        id: arc.id,
        source: arc.source,
        target: arc.target,
      },
    }));

    return [...nodes, ...edges];
  }, [petrinet]);

  useEffect(() => {
    if (cyRef.current) {
      cyRef.current
        .layout({
          name: "klay",
          klay: {
            direction: "RIGHT",
            spacing: 100,
          },
        })
        .run();
    }
  }, [elements]);

  // Function to handle export to PNG
  const handleExport = () => {
    if (cyRef.current) {
      const pngData = cyRef.current.png({ full: true, bg: "white" });
      const link = document.createElement("a");
      link.href = pngData;
      link.download = "petrinet_graph.png";
      link.click();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="font-bold text-xl">
        {algorithm} Algorithm Result
      </CardHeader>
      <CardContent>
        <div style={{ height: "500px", width: "100%" }}>
          <CytoscapeComponent
            elements={elements}
            stylesheet={[
              {
                selector: ".circleNode",
                style: circleNodeStyle,
              },
              {
                selector: ".hidNode",
                style: hidNodeStyle,
              },
              {
                selector: ".defaultNode",
                style: defaultNodeStyle,
              },
              {
                selector: ".startNode",
                style: startNodeStyle,
              },
              {
                selector: ".finalNode",
                style: finalNodeStyle,
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
            style={{ width: "100%", height: "500px", backgroundColor: "white" }}
            cy={(cy) => (cyRef.current = cy)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleExport}>Export as PNG</Button>
      </CardFooter>
    </Card>
  );
};

export default PetriNetGraph;
