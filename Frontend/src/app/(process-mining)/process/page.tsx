"use client";

import Navbar from "@/components/navbar";
import UploadCard from "@/components/uploadCard";
import { useState } from "react";
import toast from "react-hot-toast";

const EventLogUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file before uploading.");
      return;
    }

    // TODO: Add your file upload logic here

    console.log("Uploading file:", selectedFile.name);
  };

  return (
    <>
      <Navbar />
      <UploadCard
        handleFileChange={handleFileChange}
        handleFileUpload={handleFileUpload}
        selectedFile={selectedFile}
      />
    </>
  );
};

export default EventLogUploadPage;
