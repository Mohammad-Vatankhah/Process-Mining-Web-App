"use client";

import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { BPMN } from "../types/types";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import {
  defaultNodeStyle,
  finalNodeStyle,
  gatewayNodeStyle,
  simpleEdgeStyle,
  startNodeStyle,
} from "@/utils/styles";

cytoscape.use(dagre);

export default function BpmnGraph({ graphData }: { graphData: BPMN }) {
  const cyRef = useRef<cytoscape.Core | null>(null);

  const handleExport = () => {
    if (cyRef.current) {
      const pngData = cyRef.current.png({ full: true, bg: "white" });
      const link = document.createElement("a");
      link.href = pngData;
      link.download = "BPMN_graph.png";
      link.click();
    }
  };

  const handleResetPosition = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.center();
    }
  };

  useEffect(() => {
    cyRef.current = cytoscape({
      container: document.getElementById("cy"),
      elements: [
        ...graphData.nodes.map((node) => ({
          data: { id: node.id, label: node.data },
          classes:
            node.data === "start"
              ? "startNode"
              : node.data === "end"
              ? "finalNode"
              : node.type,
        })),
        ...graphData.edges.map((edge) => ({
          data: { source: edge.source, target: edge.target },
        })),
      ],
      style: [
        {
          selector: ".node",
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
          selector: ".gateway'",
          style: gatewayNodeStyle,
        },
        {
          selector: "edge",
          style: simpleEdgeStyle,
        },
      ],
      layout: { name: "dagre", rankDir: "LR" },
    });

    return () => {
      if (cyRef.current) cyRef.current.destroy();
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="font-bold text-xl">BPMN Result</CardHeader>
      <CardContent>
        <div id="cy" ref={cyRef} className="w-full h-[350px] bg-white" />
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button onClick={handleExport}>Export as PNG</Button>
        <Button onClick={handleResetPosition}>Reset Position</Button>
      </CardFooter>
    </Card>
  );
}
