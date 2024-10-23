"use client";

import PMapi from "@/API/pmAPI";
import ApplyAlgorithmCard from "@/components/applyAlgorithmCard";
import Navbar from "@/components/navbar";
import SuccessUploadCard from "@/components/successUploadCard";
import UploadCard from "@/components/uploadCard";
import { AxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import MinerResult from "@/components/minerResult";

const EventLogUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(
    null
  );
  const [result, setResult] = useState({
    alphaMiner: null,
    heuristicMiner: null,
    inductiveMiner: null,
    dfg: null,
  });

  const [appliedAlgorithms, setAppliedAlgorithms] = useState({
    alphaMiner: false,
    heuristicMiner: false,
    inductiveMiner: false,
    dfg: false,
  });

  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file before uploading.");
      return;
    }

    try {
      setUploading(true);
      const res = await PMapi.upload(selectedFile);
      setFileName(res.data.filename);
      toast.success("Your file uploaded successfully!");
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.msg || "An unexpected error occurred.";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setUploading(false);
    }
  };

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
          setResult((prev) => ({ ...prev, dfg: dfgRes.data }));
          setAppliedAlgorithms((prev) => ({ ...prev, dfg: true }));
        default:
          toast.error("Unknown algorithm selected.");
          setLoading(false);
          break;
      }
    } catch (error) {
      toast.error("Failed to apply algorithm.");
    } finally {
      setLoading(false);
      setSelectedAlgorithm("");
    }
  };

  return (
    <>
      <Navbar />
      {!fileName && (
        <UploadCard
          handleFileChange={handleFileChange}
          handleFileUpload={handleFileUpload}
          selectedFile={selectedFile}
          uploading={uploading}
        />
      )}

      {fileName && (
        <div className="grid grid-cols-1 justify-center items-start md:grid-cols-3 gap-2 px-2 mt-3 md:px-6">
          <SuccessUploadCard fileName={selectedFile?.name} />
          <ApplyAlgorithmCard
            handleAlgorithmApply={handleAlgorithmApply}
            selectedAlgorithm={selectedAlgorithm}
            setSelectedAlgorithm={setSelectedAlgorithm}
            loading={loading}
            appliedAlgorithms={appliedAlgorithms}
          />
        </div>
      )}

      <div className="flex flex-col justify-center items-center gap-2 px-5 my-4">
        {result.alphaMiner && (
          <MinerResult result={result.alphaMiner} algorithm="Alpha Miner" />
        )}
        {result.heuristicMiner && (
          <MinerResult
            result={result.heuristicMiner}
            algorithm="Heuristic Miner"
          />
        )}
        {result.inductiveMiner && (
          <MinerResult
            result={result.inductiveMiner}
            algorithm="Inductive Miner"
          />
        )}
      </div>
    </>
  );
};

export default EventLogUploadPage;
