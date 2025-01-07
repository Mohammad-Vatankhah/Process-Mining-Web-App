"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import PMapi from "@/API/pmAPI";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import SummaryPath from "./summaryPath";
import { Trace } from "@/types/types";

export default function SummaryModal({ filename }: { filename: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["summary", filename],
    queryFn: () => PMapi.getSummary(filename),
  });

  const [selectedTrace, setSelectedTrace] = useState<string | null>(null);

  const {
    case_summary = [],
    variant_frequency = {},
    total_duration_human = "",
    average_duration_human = "",
    total_cases = 0,
    start_activities = {},
    end_activities = {},
  } = data?.data || {};

  const chartData = Object.keys(variant_frequency).map((key) => ({
    name: key,
    frequency: variant_frequency[key],
  }));

  const selectedTraceData = case_summary.find(
    (trace: Trace) => trace.id === selectedTrace
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Summary</Button>
      </DialogTrigger>
      <DialogContent className="max-w-screen h-screen overflow-auto">
        {isLoading && (
          <div className="flex flex-col justify-center items-center">
            <p>Loading...</p>
          </div>
        )}
        {!isLoading && (
          <>
            <div className="h-fit">
              <DialogTitle>Summary</DialogTitle>
            </div>

            {/* Key Metrics Section */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 border rounded">
                <h2 className="text-lg font-bold mb-2">Key Metrics</h2>
                <p>
                  <strong>Total Cases:</strong> {total_cases}
                </p>
                <p>
                  <strong>Total Duration:</strong> {total_duration_human}
                </p>
                <p>
                  <strong>Average Duration:</strong> {average_duration_human}
                </p>
              </div>
              <div className="p-4 border rounded">
                <h2 className="text-lg font-bold mb-2">Start/End Activities</h2>
                <p>
                  <strong>Start Activities:</strong>{" "}
                  {Object.entries(start_activities)
                    .map(([activity, count]) => `${activity} (${count})`)
                    .join(", ")}
                </p>
                <p>
                  <strong>End Activities:</strong>{" "}
                  {Object.entries(end_activities)
                    .map(([activity, count]) => `${activity} (${count})`)
                    .join(", ")}
                </p>
              </div>
            </div>

            {/* Chart Section */}
            <div className="mb-6 h-64">
              <h2 className="text-xl font-bold mb-3">Activity Frequency</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#00ADB5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <hr />

            {/* Two-Column Layout */}
            <div className="grid grid-cols-3 gap-4 h-[290px] my-4">
              {/* Trace List (Scrollable) */}
              <div>
                <h2 className="text-xl font-bold">Traces</h2>
                <div className="overflow-y-auto border-r pr-2 h-[calc(100vh-20rem)]">
                  {case_summary.map((trace: Trace) => (
                    <div key={trace.id}>
                      <Button
                        variant="ghost"
                        className={`w-full text-left ${
                          selectedTrace === trace.id && "bg-primary text-white"
                        }`}
                        onClick={() =>
                          setSelectedTrace(
                            selectedTrace === trace.id ? null : trace.id
                          )
                        }
                      >
                        {trace.id}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trace Details */}
              <div className="pl-4 col-span-2">
                {selectedTraceData ? (
                  <div className="p-4 border rounded flex flex-col gap-3">
                    <h2 className="text-xl font-extrabold mb-2">
                      {selectedTraceData.id}
                    </h2>
                    <div className="mb-2">
                      <strong>Variant Path:</strong>
                      <div className="overflow-auto mt-2">
                        <SummaryPath
                          variantPath={selectedTraceData.variant_path || []}
                        />
                      </div>
                    </div>
                    <p>
                      <strong>Variant Count:</strong>{" "}
                      {selectedTraceData.variant_count}
                    </p>
                    <p>
                      <strong>Duration:</strong>{" "}
                      {`${selectedTraceData.duration.days} day(s), ${selectedTraceData.duration.hours} hour(s), ${selectedTraceData.duration.minutes} minute(s), ${selectedTraceData.duration.seconds} second(s)`}
                    </p>
                  </div>
                ) : (
                  <p>Select a trace to view details.</p>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
