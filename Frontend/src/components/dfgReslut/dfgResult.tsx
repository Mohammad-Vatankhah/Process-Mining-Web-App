import React, { useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import klay from "cytoscape-klay";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "../ui/button";

const nodesStyle = {
  "background-color": "#0074D9",
  label: "data(label)",
  "text-valign": "center",
  "text-halign": "center",
  shape: "round-rectangle",
  width: "label",
  padding: "10px",
  "font-size": "14px",
  "font-weight": "bold",
  color: "#fff",
  "text-outline-width": 2,
  "text-outline-color": "#0074D9",
};

const edgesStyle = {
  label: "data(label)",
  "line-color": "#878787",
  "target-arrow-color": "#878787",
  "target-arrow-shape": "triangle",
  "curve-style": "bezier",
  "font-size": "12px",
  color: "#000",
  "text-background-color": "#ffffff",
  "text-background-opacity": 0.7,
  "text-background-padding": "3px",
  "text-border-opacity": 1,
  "text-border-width": 1,
  "text-border-color": "#000",
};

cytoscape.use(klay);

export default function DfgResult({
  result,
}: {
  result: Record<string, number> | null;
}) {
  const [totalCount, setTotalCount] = useState(0);
  const [cyElements, setCyElements] = useState<any[]>([]);
  const [minWeight, setMinWeight] = useState(1);
  const [maxWeight, setMaxWeight] = useState(1);

  const cyRef = useRef<cytoscape.Core | null>(null);

  const rows = result
    ? Object.entries(result).map(([transition, count]) => {
        const [from, to] = transition.replace(/[()']/g, "").split(", ");
        return { from, to, count };
      })
    : [];

  const handleExport = () => {
    if (cyRef.current) {
      const pngData = cyRef.current.png({ full: true, bg: "white" });
      const link = document.createElement("a");
      link.href = pngData;
      link.download = "dfg-graph.png";
      link.click();
    }
  };

  useEffect(() => {
    if (result) {
      const weights = Object.values(result);
      const total = weights.reduce((sum, count) => sum + count, 0);
      setTotalCount(total);

      setMinWeight(Math.min(...weights));
      setMaxWeight(Math.max(...weights));

      const elements = rows
        .map((row) => [
          { data: { id: row.from, label: row.from } },
          { data: { id: row.to, label: row.to } },
          {
            data: {
              id: `${row.from}-${row.to}`,
              source: row.from,
              target: row.to,
              label: row.count,
              weight: row.count,
            },
          },
        ])
        .flat();

      setCyElements(elements);
    }
  }, [result]);

  return (
    <Card className="w-full">
      <CardHeader className="font-bold text-xl">
        DFG Algorithm Result
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={rows} totalCount={totalCount} />
        <div className="mt-4">
          <CytoscapeComponent
            elements={cyElements}
            style={{ width: "100%", height: "500px", backgroundColor: "white" }}
            cy={(cy) => (cyRef.current = cy)}
            layout={{
              name: "klay",
              animate: true,
              klay: {
                direction: "RIGHT",
                spacing: 100,
              },
            }}
            stylesheet={[
              {
                selector: "node",
                style: nodesStyle,
              },
              {
                selector: "edge",
                style: {
                  ...edgesStyle,
                  width: `mapData(weight, ${minWeight}, ${maxWeight}, 1, 10)`,
                },
              },
            ]}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleExport}>Export as PNG</Button>
      </CardFooter>
    </Card>
  );
}
