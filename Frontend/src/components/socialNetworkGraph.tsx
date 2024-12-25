import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { defaultNodeStyle, simpleEdgeStyle } from "@/utils/styles";

cytoscape.use(dagre);

export default function SocialNetworkGraphWithCytoscape({
  result,
}: {
  result: Record<string, string[]>;
}) {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = Object.keys(result).map((key) => ({
      data: { id: key, label: key },
    }));

    const edges = Object.entries(result).flatMap(([fromNode, toNodes]) =>
      toNodes.map((toNode) => ({
        data: { source: fromNode, target: toNode },
      }))
    );

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: "node",
          style: defaultNodeStyle,
        },
        {
          selector: "edge",
          style: simpleEdgeStyle,
        },
      ],
      layout: {
        name: "dagre",
        rankDir: "LR",
      },
    });

    cyRef.current = cy;

    return () => cy.destroy();
  }, [result]);

  const handleExport = () => {
    if (cyRef.current) {
      const pngData = cyRef.current.png({ full: true, bg: "white" });
      const link = document.createElement("a");
      link.href = pngData;
      link.download = "Social_Network_graph.png";
      link.click();
    }
  };

  const handleResetPosition = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.center();
    }
  };

  return (
    <Card className="w-full px-3 pb-3">
      <CardHeader className="font-bold text-xl">
        Social Network Algorithm Result
      </CardHeader>
      <CardContent className="w-full h-[400px] bg-white rounded">
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button onClick={handleExport}>Export as PNG</Button>
        <Button onClick={handleResetPosition}>Reset Position</Button>
      </CardFooter>
    </Card>
  );
}
