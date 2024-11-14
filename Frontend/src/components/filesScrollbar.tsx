"use client";

import { ChevronsLeft } from "lucide-react";
import React, { Dispatch, useState } from "react";
import { FileData } from "./profilePage";
import ProfileProcessCard from "./profileProcessCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Pagination from "./pagination";

export default function FilesScrollbar({
  files,
  selectedFile,
  setSelectedFile,
  currentPage,
  setCurrentPage,
  totalPages,
  filesPerPage,
}: {
  files: FileData[];
  selectedFile: string;
  setSelectedFile: Dispatch<React.SetStateAction<string>>;
  currentPage: number;
  setCurrentPage: Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  filesPerPage: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState("");

  const filteredFiles = search
    ? files.filter((file) =>
        file.original_filename.toLowerCase().startsWith(search.toLowerCase())
      )
    : files;

  const currentFiles = filteredFiles?.slice(
    (currentPage - 1) * filesPerPage,
    currentPage * filesPerPage
  );

  return (
    <div
      className={`absolute md:relative z-20 flex flex-col px-5 mt-3 py-6 bg-white rounded-tr-lg rounded-br-lg shadow gap-3 h-fit transition-all duration-300 ${
        !isOpen && "ml-[-250px]"
      }`}
    >
      <div className="flex justify-between">
        <h1 className="font-bold text-lg">Your Files</h1>
        <Button variant="destructive" onClick={() => setSelectedFile("")}>
          Deselect
        </Button>
      </div>
      <Input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {currentFiles.map((file, idx) => (
        <ProfileProcessCard
          fileData={file}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          key={idx}
        />
      ))}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      )}

      <div className="absolute bg-background rounded cursor-pointer right-[-12px] top-8 shadow">
        <ChevronsLeft
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-0" : "rotate-180"
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
        />
      </div>
    </div>
  );
}
