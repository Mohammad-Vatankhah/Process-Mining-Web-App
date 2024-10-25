import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
  MarkerType,
  Controls,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardContent, CardHeader } from "./ui/card";
import FloatingEdge from "./floatingEdge";

export default function SocialNetworkGraph({
  result,
}: {
  result: Record<string, string[]>;
}) {
  const initialNodes: Node[] = useMemo(() => {
    const center = { x: 0, y: 0 };
    const radius = 450;
    const nodeCount = Object.keys(result).length;

    return Object.keys(result).map((key, index) => {
      const angle = (2 * Math.PI * index) / nodeCount;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);

      return {
        id: key,
        data: { label: key },
        position: { x, y },
      };
    });
  }, [result]);

  const initialEdges: Edge[] = useMemo(() => {
    const edgesList: Edge[] = [];
    Object.entries(result).forEach(([fromNode, toNodes]) => {
      toNodes.forEach((toNode) => {
        edgesList.push({
          id: `${fromNode}-${toNode}`,
          source: fromNode,
          target: toNode,
          type: "floating",
          markerEnd: {
            type: MarkerType.Arrow,
          },
        });
      });
    });
    return edgesList;
  }, [result]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const edgeTypes = useMemo(() => ({ floating: FloatingEdge }), []);

  return (
    <Card className="w-full px-3 pb-3">
      <CardHeader className="font-bold text-xl">
        Social Network Algorithm Result
      </CardHeader>
      <CardContent className="w-full h-[400px] bg-white rounded">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={edgeTypes}
          fitView
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </CardContent>
    </Card>
  );
}
