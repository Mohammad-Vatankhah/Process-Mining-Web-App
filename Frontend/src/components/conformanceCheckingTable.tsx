import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export default function ConformanceCheckingTable({ alignments }) {
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
    visitedStates: value.visited_states,
    traversedArcs: value.traversed_arcs,
    queuedStates: value.queued_states,
    lpSolved: value.lp_solved,
    alignment: value.alignment.map((pair) => {
      const [event, transition] = pair;
      return {
        pair: `${event} → ${transition}`,
        classification: classifyAlignment(event, transition),
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
            <TableHead>Visited States</TableHead>
            <TableHead>Traversed Arcs</TableHead>
            <TableHead>Queued States</TableHead>
            <TableHead>LP Solved</TableHead>
            <TableHead>Alignment</TableHead>
            <TableHead>Classification</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.fitness}</TableCell>
              <TableCell>{row.visitedStates}</TableCell>
              <TableCell>{row.traversedArcs}</TableCell>
              <TableCell>{row.queuedStates}</TableCell>
              <TableCell>{row.lpSolved}</TableCell>
              <TableCell>
                {row.alignment.map((pair, index) => (
                  <div key={index}>{pair.pair}</div>
                ))}
              </TableCell>
              <TableCell>
                {row.alignment.map((pair, index) => (
                  <div key={index}>{pair.classification}</div>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
