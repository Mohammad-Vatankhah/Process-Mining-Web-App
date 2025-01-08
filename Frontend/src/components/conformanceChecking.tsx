"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Upload } from "lucide-react";
import PMapi from "@/API/pmAPI";
import toast from "react-hot-toast";
import AlignmentVisualization from "./alignmentVisualization";

export default function ConformanceChecking({
  filename,
}: {
  filename: string;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [conformanceResult, setConformanceResult] = useState({});
  const [modelGraph, setModelGraph] = useState();
  const [sampleLoading, setSampleLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleUpload = async (sampleFilename: string | undefined) => {
    if (!selectedFile && !sampleFilename) {
      toast.error("Please upload a file first");
      return;
    }
    try {
      if (sampleFilename) setSampleLoading(true);
      else setLoading(true);

      const res = await PMapi.conformanceChecking(
        filename,
        selectedFile!,
        sampleFilename
      );
      setConformanceResult(res.data);
      const ilpResult = await PMapi.ilpMiner(filename);
      setModelGraph(ilpResult.data);
    } catch (error) {
      toast.error("An unxpected error occurred!");
    } finally {
      setLoading(false);
      setSampleLoading(false);
    }
  };

  useEffect(() => {
    setConformanceResult({});
    setModelGraph(undefined);
    setSelectedFile(null);
  }, [filename]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Conformance Checking</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col max-w-screen h-screen overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Conformance Checking</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center">
          <label className="w-1/2 cursor-pointer flex items-center justify-center p-6 bg-gray-100 border border-dashed border-primary rounded-lg hover:bg-gray-200 transition-colors">
            <div className="text-center flex flex-col justify-center items-center">
              <Upload className="h-10 w-10 text-gray-500" />
              <p className="mt-2 text-gray-700">Click to select your file</p>
            </div>
            <Input
              type="file"
              accept=".csv,.xes"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        {selectedFile && (
          <p className="">{`Selected File: ${selectedFile.name}`}</p>
        )}
        <div className="flex flex-col w-1/2 self-center gap-3">
          <Button
            onClick={() => handleUpload(undefined)}
            disabled={loading || sampleLoading}
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
          <div className="w-full flex flex-col">
            <p>Or use Sample file</p>
            <Button
              onClick={() => handleUpload("loan_process_with_unfit_traces.xes")}
              disabled={loading || sampleLoading}
            >
              {sampleLoading ? "Working on it..." : "Use sample"}
            </Button>
          </div>
        </div>
        {conformanceResult && modelGraph && (
          <AlignmentVisualization
            alignmentResults={conformanceResult}
            modelGraph={modelGraph}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
