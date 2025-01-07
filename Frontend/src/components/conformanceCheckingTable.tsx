import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { classifyAlignment } from "@/utils/conformanceUtils";
import { AlignmentData } from "@/types/types";

export default function ConformanceCheckingTable({
  currentTrace,
  traceID,
}: {
  currentTrace: AlignmentData;
  traceID: number;
}) {
  const alignment = currentTrace.alignment.map((pair) => {
    const [event, transition] = pair;
    return {
      pair: `${event} → ${transition || "N/A"}`,
      classification: classifyAlignment(event, transition!),
    };
  });

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
          <TableRow>
            <TableCell>{traceID}</TableCell>
            <TableCell>{Number(currentTrace.fitness * 100).toFixed(2)}%</TableCell>
            <TableCell>
              {alignment.map((pair, index) => (
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
              {alignment.map((pair, index) => (
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
        </TableBody>
      </Table>
    </div>
  );
}
