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

export default function ApplyAlgorithmCard({
  selectedAlgorithm,
  loading,
  setSelectedAlgorithm,
  handleAlgorithmApply,
  appliedAlgorithms,
}: {
  selectedAlgorithm: string | null;
  loading: boolean;
  setSelectedAlgorithm: (value: string) => void;
  handleAlgorithmApply: () => void;
  appliedAlgorithms: {
    alphaMiner: boolean;
    heuristicMiner: boolean;
    inductiveMiner: boolean;
    dfg: boolean;
    socialNetwork: boolean;
  };
}) {
  const algorithms = [
    { id: "alpha", name: "Alpha Miner", applied: appliedAlgorithms.alphaMiner },
    {
      id: "heuristic",
      name: "Heuristic Miner",
      applied: appliedAlgorithms.heuristicMiner,
    },
    {
      id: "inductive",
      name: "Inductive Miner",
      applied: appliedAlgorithms.inductiveMiner,
    },
    {
      id: "dfg",
      name: "Directly Follows Graph (DFG)",
      applied: appliedAlgorithms.dfg,
    },
    {
      id: "socialNetwork",
      name: "Social Network",
      applied: appliedAlgorithms.socialNetwork,
    },
  ];

  return (
    <Card className="w-full md:col-start-2 md:col-end-4">
      <CardHeader className="text-2xl font-semibold mb-2">
        Select an Algorithm
      </CardHeader>
      <CardContent>
        <Select
          value={selectedAlgorithm || ""}
          onValueChange={setSelectedAlgorithm}
        >
          <SelectTrigger value="">
            <SelectValue placeholder="Select an algorithm" />
          </SelectTrigger>
          <SelectContent>
            {algorithms.map((algorithm) => (
              <SelectItem
                key={algorithm.id}
                value={algorithm.id}
                disabled={algorithm.applied}
              >
                {algorithm.name}
                {algorithm.applied && " (Applied)"}{" "}
                {/* Display applied label */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleAlgorithmApply}
          className="mt-6 w-full"
          disabled={
            !selectedAlgorithm ||
            loading ||
            appliedAlgorithms[
              selectedAlgorithm as keyof typeof appliedAlgorithms
            ]
          }
        >
          {loading ? "Applying..." : "Apply Algorithm"}
        </Button>
      </CardContent>
    </Card>
  );
}
