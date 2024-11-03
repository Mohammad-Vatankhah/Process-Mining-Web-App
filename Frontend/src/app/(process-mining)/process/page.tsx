"use client";

import PMapi from "@/API/pmAPI";
import ApplyAlgorithm from "@/components/applyAlgorithm";
import Navbar from "@/components/navbar";
import UploadCard from "@/components/uploadCard";
import { AxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

const EventLogUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

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

      <ApplyAlgorithm
        fileName={fileName}
        selectedFileName={selectedFile?.name}
        fromHistory={false}
      />
    </>
  );
};

export default EventLogUploadPage;
