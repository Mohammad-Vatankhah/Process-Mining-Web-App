import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type AlignmentData = {
  alignment: [string, string | null][]; // An array of tuples with string and optional null values
  bwc: number; // Best Worst Case cost
  cost: number; // Alignment cost
  fitness: number; // Fitness value
  lp_solved: number; // Number of LP problems solved
  queued_states: number; // Number of states queued
  traversed_arcs: number; // Number of arcs traversed
  visited_states: number; // Number of states visited
};

type Alignments = {
  [key: string]: AlignmentData; // A dictionary where keys are strings and values are AlignmentData
};

export default function ConformanceCheckingTable({
  alignments,
}: {
  alignments: Alignments;
}) {
  const classifyAlignment = (event: string, transition: string) => {
    if (event !== ">>" && transition !== ">>" && event === transition) {
      return "Sync move"; // event and transition labels correspond
    }

    if (event === ">>" && transition !== ">>") {
      return "Move on log"; // transition is ">>", indicating a move in the trace
    }

    if (transition === ">>" && event !== ">>") {
      return "Move on model"; // event is ">>", indicating a move in the model
    }

    // Further classify moves on the model
    if (transition === ">>" && event === ">>") {
      return "Move on model involving hidden transitions"; // Fit move (if it's a hidden transition)
    }

    return "Move on model not involving hidden transitions"; // Unfit move
  };

  const rows = Object.entries(alignments).map(([key, value]) => ({
    id: key,
    fitness: value.fitness,
    cost: value.cost,
    bwc: value.bwc,
    alignment: value.alignment.map((pair) => {
      const [event, transition] = pair;
      return {
        pair: `${event} → ${transition}`,
        classification: classifyAlignment(event, transition!),
      };
    }),
  }));

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trace ID</TableHead>
            <TableHead>Fitness</TableHead>
            <TableHead>Alignment</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.fitness}</TableCell>
              <TableCell>
                {row.alignment.map((pair, index) => (
                  <div
                    key={index}
                    className={
                      pair.classification === "Sync move" ||
                      pair.classification ===
                        "Move on model involving hidden transitions"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {pair.pair}
                  </div>
                ))}
              </TableCell>
              <TableCell>
                {row.alignment.map((pair, index) => (
                  <div
                    key={index}
                    className={
                      pair.classification === "Sync move" ||
                      pair.classification ===
                        "Move on model involving hidden transitions"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {pair.classification}
                  </div>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
