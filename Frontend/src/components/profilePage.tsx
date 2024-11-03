"use client";

import api from "@/API/userAPI";
import { useQuery } from "@tanstack/react-query";
import ProfileProcessSceleton from "./profileProcessSceleton";
import ProfileProcessCard from "./profileProcessCard";
import { useState } from "react";
import ApplyAlgorithm from "./applyAlgorithm";
import FilesScrollbar from "./filesScrollbar";

export type FileData = {
  original_filename: string;
  saved_filename: string;
  uploaded_at: string;
};

export default function ProfilePage() {
  const [selectedFile, setSelectedFile] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => api.getHistory(),
  });

  if (isLoading) {
    return (
      <div className="px-2 md:px-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
        <ProfileProcessSceleton />
      </div>
    );
  }

  return (
    <>
      <div className="px-2 md:px-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data &&
          !selectedFile &&
          data.data.files.map((file: FileData, idx: number) => (
            <ProfileProcessCard
              fileData={file}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              key={idx}
            />
          ))}
      </div>

      {data && selectedFile && (
        <div className="flex">
          <FilesScrollbar
            files={data.data.files}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
          <div className="flex flex-col w-full">
            <ApplyAlgorithm
              fileName={selectedFile}
              fromHistory
              selectedFileName=""
            />
          </div>
        </div>
      )}
    </>
  );
}
