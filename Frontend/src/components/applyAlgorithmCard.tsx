import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { TopTracesModal } from "./topTracesModal";
import ConformanceChecking from "./conformanceChecking";
import SummaryModal from "./summaryModal";

export default function ApplyAlgorithmCard({
  selectedAlgorithm,
  loading,
  setSelectedAlgorithm,
  handleAlgorithmApply,
  selectedFileName,
}: {
  selectedAlgorithm: string | null;
  loading: boolean;
  setSelectedAlgorithm: (value: string) => void;
  handleAlgorithmApply: () => void;
  selectedFileName: string | undefined;
}) {
  const algorithms = [
    { id: "alpha", name: "Alpha Miner" },
    {
      id: "heuristic",
      name: "Heuristic Miner",
    },
    {
      id: "inductive",
      name: "Inductive Miner",
    },
    {
      id: "ilp",
      name: "ILP Miner",
    },
    { id: "bpmn", name: "BPMN" },
    {
      id: "dfg",
      name: "Directly Follows Graph (DFG)",
    },
    {
      id: "footprint",
      name: "Footprint",
    },
  ];

  return (
    <Card className="w-full md:col-start-2 md:col-end-4">
      <CardHeader className="text-2xl font-semibold mb-2">
        Select an Algorithm
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Select
            value={selectedAlgorithm || ""}
            onValueChange={setSelectedAlgorithm}
          >
            <SelectTrigger value="">
              <SelectValue placeholder="Select an algorithm" />
            </SelectTrigger>
            <SelectContent>
              {algorithms.map((algorithm) => (
                <SelectItem key={algorithm.id} value={algorithm.id}>
                  {algorithm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedFileName && (
            <>
              <TopTracesModal filename={selectedFileName} />
              <ConformanceChecking filename={selectedFileName} />
              <SummaryModal filename={selectedFileName} />
            </>
          )}
        </div>
        <Button
          onClick={handleAlgorithmApply}
          className="mt-6 w-full"
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply Algorithm"}
        </Button>
      </CardContent>
    </Card>
  );
}
