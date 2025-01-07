"use client";

import PMapi from "@/API/pmAPI";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ApplyAlgorithmCard from "./applyAlgorithmCard";
import BpmnGraph from "./bpmnGraph";
import DfgResult from "./dfgReslut/dfgResult";
import FootprintTable from "./footprintResult";
import PetriNetGraph from "./petrinetGraph";
import SuccessUploadCard from "./successUploadCard";
import { AlgorithmResult } from "@/types/types";

export default function ApplyAlgorithm({
  selectedFileName,
  fileName,
  fromHistory,
}: {
  selectedFileName: string | undefined;
  fileName: string | undefined;
  fromHistory: boolean;
}) {
  const [result, setResult] = useState<AlgorithmResult | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const handleAlgorithmApply = async () => {
    if (!selectedAlgorithm) {
      toast.error("Please select an algorithm before applying.");
      return;
    }

    setLoading(true);

    try {
      let newResult: AlgorithmResult | null = null;
      switch (selectedAlgorithm) {
        case "alpha":
          const alphaMinerRes = await PMapi.alphaMiner(fileName!);
          newResult = { type: "alphaMiner", data: alphaMinerRes.data };
          break;
        case "heuristic":
          const heuristicRes = await PMapi.heuristicMiner(fileName!);
          newResult = { type: "heuristicMiner", data: heuristicRes.data };
          break;
        case "inductive":
          const inductiveRes = await PMapi.inductiveMiner(fileName!);
          newResult = { type: "inductiveMiner", data: inductiveRes.data };
          break;
        case "ilp":
          const ilpRes = await PMapi.ilpMiner(fileName!);
          newResult = { type: "ilpMiner", data: ilpRes.data };
          break;
        case "dfg":
          const dfgRes = await PMapi.dfg(fileName!);
          newResult = { type: "dfg", data: dfgRes.data.dfg };
          break;
        case "footprint":
          const footprintRes = await PMapi.footprint(fileName!);
          newResult = { type: "footprint", data: footprintRes.data };
          break;
        case "bpmn":
          const bpmnRes = await PMapi.bpmn(fileName!);
          newResult = { type: "bpmn", data: bpmnRes.data };
          break;
        default:
          toast.error("Unknown algorithm selected.");
          break;
      }

      if (newResult) {
        setResult(newResult);
        toast.success("Algorithm applied successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply the algorithm.");
    } finally {
      setLoading(false);
      setSelectedAlgorithm(null);
    }
  };

  useEffect(() => {
    setResult(null); // Clear the result when the fileName changes
  }, [fileName]);

  return (
    <>
      {fileName && (
        <div
          className={`grid grid-cols-1 justify-center items-start ${
            fromHistory || !selectedFileName ? "md:flex" : "md:grid-cols-3"
          } gap-2 px-2 mt-3 md:px-6`}
        >
          {!fromHistory && selectedFileName && (
            <SuccessUploadCard fileName={selectedFileName} />
          )}
          <ApplyAlgorithmCard
            handleAlgorithmApply={handleAlgorithmApply}
            selectedAlgorithm={selectedAlgorithm}
            setSelectedAlgorithm={setSelectedAlgorithm}
            loading={loading}
            selectedFileName={fileName}
          />
        </div>
      )}

      <div className="flex flex-col justify-center items-center gap-6 px-5 my-4">
        {result?.type === "alphaMiner" && (
          <PetriNetGraph
            petrinet={result.data}
            algorithm="Alpha Miner"
            setResult={setResult}
            filename={fileName!}
          />
        )}
        {result?.type === "heuristicMiner" && (
          <PetriNetGraph
            petrinet={result.data}
            algorithm="Heuristic Miner"
            setResult={setResult}
            filename={fileName!}
          />
        )}
        {result?.type === "inductiveMiner" && (
          <PetriNetGraph
            petrinet={result.data}
            algorithm="Inductive Miner"
            setResult={setResult}
            filename={fileName!}
          />
        )}
        {result?.type === "ilpMiner" && (
          <PetriNetGraph
            petrinet={result.data}
            algorithm="ILP Miner"
            setResult={setResult}
            filename={fileName!}
          />
        )}
        {result?.type === "bpmn" && <BpmnGraph graphData={result.data} />}
        {result?.type === "dfg" && <DfgResult result={result.data} />}
        {result?.type === "footprint" && (
          <FootprintTable result={result.data} />
        )}
      </div>
    </>
  );
}
