import React, { useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { AlignmentData, PetriNet } from "@/types/types";
import ConformanceCheckingTable from "./conformanceCheckingTable";
import { classifyAlignment } from "@/utils/conformanceUtils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  circleNodeStyle,
  defaultNodeStyle,
  finalNodeStyle,
  fitNodeStyle,
  simpleEdgeStyle,
  startNodeStyle,
  unfitNodeStyle,
} from "@/utils/styles";
import toast from "react-hot-toast";

cytoscape.use(dagre);

const AlignmentGraph = ({
  modelGraph,
  alignmentResults,
}: {
  modelGraph: PetriNet;
  alignmentResults: Record<string, AlignmentData>;
}) => {
  const [currentTraceIndex, setCurrentTraceIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("all");
  const [filteredTraces, setFilteredTraces] = useState(
    Object.keys(alignmentResults)
  );

  const options = [
    {
      id: "all",
      name: "All Traces",
    },
    {
      id: "fit",
      name: "Fit Traces",
    },
    {
      id: "unfit",
      name: "Unfit Traces",
    },
  ];
  const cyRef = useRef<cytoscape.Core | null>(null);

  const traceKeys = filteredTraces;
  const currentTrace = alignmentResults[traceKeys[currentTraceIndex]];

  useEffect(() => {
    setSelectedOption("all");
  }, [alignmentResults]);

  useEffect(() => {
    const filtered = Object.keys(alignmentResults).filter((key) => {
      const trace = alignmentResults[key];
      const fitness = trace.fitness;

      if (selectedOption === "all") {
        return true;
      } else if (selectedOption === "fit") {
        return fitness === 1;
      } else if (selectedOption === "unfit") {
        return fitness < 1;
      }
      return false;
    });

    if (filtered.length === 0) {
      toast.error("No traces found");
      setSelectedOption("all")
      return;
    }
    setFilteredTraces(filtered);
    setCurrentTraceIndex(0);
  }, [selectedOption, alignmentResults]);

  const elements = React.useMemo(() => {
    const regex =
      /\(\{(?:'[^']*'(?:,\s*)?)+\}(?:,\s*\{(?:'[^']*'(?:,\s*)?)*\})*\)/;
    const initialNodes: string[] = JSON.parse(
      modelGraph.im.replace(/'/g, '"')
    ).map((label: string) => label.split(":")[0]);
    const finalNodes: string[] = JSON.parse(
      modelGraph.fm.replace(/'/g, '"')
    ).map((label: string) => label.split(":")[0]);

    const fitNodes: string[] = [];
    currentTrace.alignment.map((trace) => {
      if (classifyAlignment(trace[0], trace[1]) === "Sync move") {
        fitNodes.push(trace[0]);
      }
    });

    const unfitNodes: string[] = [];
    currentTrace.alignment.map((trace: string[]) => {
      if (
        classifyAlignment(trace[0], trace[1]) === "Move on log" ||
        "Move on model"
      ) {
        unfitNodes.push(trace[1]);
      }
    });

    const nodes = [
      ...modelGraph.net.places.map((place) => {
        const circleNode =
          place.label.startsWith("intplace_") ||
          place.label.startsWith("splace_") ||
          place.label.startsWith("pre_") ||
          regex.test(place.label);

        const isStartNode = initialNodes.includes(place.label);
        const isFinalNode = finalNodes.includes(place.label);
        const isFitNode = fitNodes.includes(place.label);
        const isUnfitNode = unfitNodes.includes(place.label);
        const isNumericalNode = /^\d+$/.test(place.label);
        return {
          data: {
            id: place.id,
            label: isStartNode ? "Start" : isFinalNode ? "End" : place.label,
          },
          classes: isStartNode
            ? "startNode"
            : isFinalNode
            ? "finalNode"
            : circleNode || isNumericalNode
            ? "circleNode"
            : isFitNode
            ? "fitNode"
            : isUnfitNode
            ? "unfitNode"
            : "defaultNode",
        };
      }),
      ...modelGraph.net.transitions.map((transition) => {
        const isFitNode = fitNodes.includes(transition.label);
        const isUnfitNode = unfitNodes.includes(transition.label);
        return {
          data: { id: transition.id, label: transition.label },
          classes: isFitNode
            ? "fitNode"
            : isUnfitNode
            ? "unfitNode"
            : "defaultNode",
        };
      }),
    ];

    const edges = modelGraph.net.arcs.map((arc) => ({
      data: {
        id: arc.id,
        source: arc.source,
        target: arc.target,
      },
    }));

    return [...nodes, ...edges];
  }, [modelGraph, currentTrace]);

  const handleNext = () => {
    if (currentTraceIndex < traceKeys.length - 1) {
      setCurrentTraceIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTraceIndex > 0) {
      setCurrentTraceIndex((prev) => prev - 1);
    }
  };

  const handleResetPosition = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.center();
    }
  };

  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.layout({ name: "dagre", rankDir: "LR" }).run();
    }
  }, [elements]);

  return (
    <div>
      <hr />
      <h2 className="text-2xl font-bold mt-2">Conformance Checking Result</h2>
      <div className="flex items-center gap-2 w-fit mt-3">
        <p>Show</p>
        <Select value={selectedOption || ""} onValueChange={setSelectedOption}>
          <SelectTrigger value="">
            <SelectValue placeholder="Select an algorithm" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between mt-5 mb-2">
        <Button onClick={handlePrevious} disabled={currentTraceIndex === 0}>
          Previous Trace
        </Button>
        <span>
          {traceKeys.length > 0 ? (
            <div className="flex items-center gap-2">
              Trace{" "}
              <Input
                type="number"
                className="w-20"
                value={currentTraceIndex + 1}
                onChange={(e) =>
                  e.target.value &&
                  parseInt(e.target.value) <= traceKeys.length &&
                  parseInt(e.target.value) > 0 &&
                  setCurrentTraceIndex(parseInt(e.target.value) - 1)
                }
                min={1}
                max={traceKeys.length}
              />
              /{traceKeys.length}
            </div>
          ) : (
            "No alignment data available"
          )}
        </span>
        <Button
          onClick={handleNext}
          disabled={
            currentTraceIndex === traceKeys.length - 1 || !traceKeys.length
          }
        >
          Next Trace
        </Button>
      </div>
      <CytoscapeComponent
        elements={elements}
        stylesheet={[
          {
            selector: ".circleNode",
            style: circleNodeStyle,
          },
          {
            selector: ".defaultNode",
            style: defaultNodeStyle,
          },
          {
            selector: ".startNode",
            style: startNodeStyle,
          },
          {
            selector: ".finalNode",
            style: finalNodeStyle,
          },
          {
            selector: ".fitNode",
            style: fitNodeStyle,
          },
          {
            selector: ".unfitNode",
            style: unfitNodeStyle,
          },
          {
            selector: "edge",
            style: simpleEdgeStyle,
          },
        ]}
        style={{ width: "100%", height: "500px", backgroundColor: "white" }}
        cy={(cy) => (cyRef.current = cy)}
      />
      <Button className="my-2" onClick={handleResetPosition}>
        Reset Position
      </Button>
      <ConformanceCheckingTable
        currentTrace={currentTrace}
        traceID={currentTraceIndex + 1}
      />
    </div>
  );
};

export default AlignmentGraph;
