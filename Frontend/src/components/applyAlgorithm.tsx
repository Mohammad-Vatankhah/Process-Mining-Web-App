"use client";

import React, { useEffect, useState } from "react";
import SuccessUploadCard from "./successUploadCard";
import ApplyAlgorithmCard from "./applyAlgorithmCard";
import MinerResult from "./minerResult";
import DfgResult from "./dfgReslut/dfgResult";
import SocialNetworkGraph from "./socialNetworkGraph";
import toast from "react-hot-toast";
import PMapi from "@/API/pmAPI";
import PetriNetGraph from "./petrinetGraph";

export default function ApplyAlgorithm({
  selectedFileName,
  fileName,
  fromHistory,
}: {
  selectedFileName: string | undefined;
  fileName: string;
  fromHistory: boolean;
}) {
  const [result, setResult] = useState({
    alphaMiner: null,
    heuristicMiner: null,
    inductiveMiner: null,
    dfg: null,
    socialNetwork: null,
  });

  const [appliedAlgorithms, setAppliedAlgorithms] = useState({
    alphaMiner: false,
    heuristicMiner: false,
    inductiveMiner: false,
    dfg: false,
    socialNetwork: false,
  });

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
      switch (selectedAlgorithm) {
        case "alpha":
          const alphaMinerRes = await PMapi.alphaMiner(fileName);
          setResult((prev) => ({ ...prev, alphaMiner: alphaMinerRes.data }));
          setAppliedAlgorithms((prev) => ({ ...prev, alphaMiner: true }));
          break;

        case "heuristic":
          const hueristicRes = await PMapi.heuristicMiner(fileName);
          setResult((prev) => ({ ...prev, heuristicMiner: hueristicRes.data }));
          setAppliedAlgorithms((prev) => ({ ...prev, heuristicMiner: true }));
          break;

        case "inductive":
          const inductiveRes = await PMapi.inductiveMiner(fileName);
          setResult((prev) => ({ ...prev, inductiveMiner: inductiveRes.data }));
          setAppliedAlgorithms((prev) => ({ ...prev, inductiveMiner: true }));
          break;

        case "dfg":
          const dfgRes = await PMapi.dfg(fileName);
          setResult((prev) => ({ ...prev, dfg: dfgRes.data.dfg }));
          setAppliedAlgorithms((prev) => ({ ...prev, dfg: true }));
          break;

        case "socialNetwork":
          const socialRes = await PMapi.socialNetwork(fileName);
          setResult((prev) => ({
            ...prev,
            socialNetwork: socialRes.data.social_network,
          }));
          setAppliedAlgorithms((prev) => ({ ...prev, socialNetwork: true }));
          break;

        default:
          toast.error("Unknown algorithm selected.");
          break;
      }
      toast.success("Applied successfully!");
    } catch (error) {
      toast.error("Failed to apply algorithm.");
    } finally {
      setLoading(false);
      setSelectedAlgorithm("");
    }
  };

  const resetResult = () => {
    setResult({
      alphaMiner: null,
      heuristicMiner: null,
      inductiveMiner: null,
      dfg: null,
      socialNetwork: null,
    });

    setAppliedAlgorithms({
      alphaMiner: false,
      heuristicMiner: false,
      inductiveMiner: false,
      dfg: false,
      socialNetwork: false,
    });
  };

  useEffect(() => {
    resetResult();
  }, [fileName]);

  console.log(result);

  return (
    <>
      {fileName && (
        <div
          className={`grid grid-cols-1 justify-center items-start ${
            fromHistory ? "md:flex" : "md:grid-cols-3"
          } gap-2 px-2 mt-3 md:px-6`}
        >
          {!fromHistory && <SuccessUploadCard fileName={selectedFileName} />}
          <ApplyAlgorithmCard
            handleAlgorithmApply={handleAlgorithmApply}
            selectedAlgorithm={selectedAlgorithm}
            setSelectedAlgorithm={setSelectedAlgorithm}
            loading={loading}
            appliedAlgorithms={appliedAlgorithms}
          />
        </div>
      )}

      <div className="flex flex-col justify-center items-center gap-6 px-5 my-4">
        {result.alphaMiner && (
          // <MinerResult result={result.alphaMiner} algorithm="Alpha Miner" />
          <PetriNetGraph petrinet={result.alphaMiner} algorithm="Alpha Miner" />
        )}
        {result.heuristicMiner && (
          // <MinerResult
          //   result={result.heuristicMiner}
          // />
          <PetriNetGraph
            petrinet={result.heuristicMiner}
            algorithm="Heuristic Miner"
          />
        )}
        {result.inductiveMiner && (
          <PetriNetGraph
            petrinet={result.inductiveMiner}
            algorithm="Inductive Miner"
          />
        )}
        {result.dfg && <DfgResult result={result.dfg} />}
        {result.socialNetwork && (
          <SocialNetworkGraph result={result.socialNetwork} />
        )}
      </div>
    </>
  );
}
