import React, { useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import klay from "cytoscape-klay";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "../ui/button";
import { defaultNodeStyle, dfgEdgesStyle } from "@/utils/styles";

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

  const handleResetPosition = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.center();
    }
  };

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
                style: defaultNodeStyle,
              },
              {
                selector: "edge",
                style: {
                  ...dfgEdgesStyle,
                  width: `mapData(weight, ${minWeight}, ${maxWeight}, 1, 10)`,
                },
              },
            ]}
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button onClick={handleExport}>Export as PNG</Button>
        <Button onClick={handleResetPosition}>Reset Position</Button>
      </CardFooter>
    </Card>
  );
}
