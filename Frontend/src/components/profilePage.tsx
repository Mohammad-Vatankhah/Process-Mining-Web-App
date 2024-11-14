"use client";

import api from "@/API/userAPI";
import { useQuery } from "@tanstack/react-query";
import ProfileProcessSceleton from "./profileProcessSceleton";
import ProfileProcessCard from "./profileProcessCard";
import { useState } from "react";
import ApplyAlgorithm from "./applyAlgorithm";
import FilesScrollbar from "./filesScrollbar";
import { Input } from "./ui/input";
import Pagination from "./pagination";

export type FileData = {
  original_filename: string;
  saved_filename: string;
  uploaded_at: string;
};

export default function ProfilePage() {
  const [selectedFile, setSelectedFile] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 9;

  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => api.getHistory(),
  });

  const filteredFiles = search
    ? data?.data.files.filter((file: FileData) =>
        file.original_filename.toLowerCase().startsWith(search.toLowerCase())
      )
    : data?.data.files;

  const totalPages = filteredFiles
    ? Math.ceil(filteredFiles.length / filesPerPage)
    : 1;

  const currentFiles = filteredFiles?.slice(
    (currentPage - 1) * filesPerPage,
    currentPage * filesPerPage
  );

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
      {!selectedFile && (
        <div className="px-2 md:px-32 mb-3 max-w-fit">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}
      <div className="px-2 md:px-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data &&
          !selectedFile &&
          currentFiles?.map((file: FileData, idx: number) => (
            <ProfileProcessCard
              fileData={file}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              key={idx}
            />
          ))}
      </div>

      {totalPages > 1 && !selectedFile && (
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      )}

      {data && selectedFile && (
        <div className="flex">
          <FilesScrollbar
            files={data.data.files}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            filesPerPage={filesPerPage}
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
