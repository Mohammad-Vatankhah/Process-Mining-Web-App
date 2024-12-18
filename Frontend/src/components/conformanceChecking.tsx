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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please upload a file first");
      return;
    }
    try {
      setLoading(true);
      const res = await PMapi.conformanceChecking(filename, selectedFile);
      setConformanceResult(res.data);
      const ilpResult = await PMapi.ilpMiner(filename);
      setModelGraph(ilpResult.data);
    } catch (error) {
      toast.error("An unxpected error occurred!");
    } finally {
      setLoading(false);
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
      <DialogContent className="max-w-screen h-screen overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Conformance Checking</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center">
          <label className="w-full cursor-pointer flex items-center justify-center p-6 bg-gray-100 border border-dashed border-primary rounded-lg hover:bg-gray-200 transition-colors">
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
        <Button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
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
