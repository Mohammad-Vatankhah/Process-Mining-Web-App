"use client";

import { ChevronsLeft } from "lucide-react";
import React, { Dispatch, useEffect, useRef, useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const scrollbarRef = useRef(null);

  const filteredFiles = search
    ? files.filter((file) =>
        file.original_filename.toLowerCase().startsWith(search.toLowerCase())
      )
    : files;

  const currentFiles = filteredFiles?.slice(
    (currentPage - 1) * filesPerPage,
    currentPage * filesPerPage
  );

  const handleClickOutside = (event: MouseEvent) => {
    if (scrollbarRef.current && !scrollbarRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`fixed top-20 left-0 z-20 flex flex-col px-5 py-6 bg-white rounded-tr-lg rounded-br-lg shadow-2xl gap-3 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "left-3 -translate-x-full"
      }`}
      style={{
        height: "calc(100vh - 80px)",
      }}
      ref={scrollbarRef}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-lg">Your Files</h1>
        <Button variant="destructive" onClick={() => setSelectedFile("")}>
          Deselect
        </Button>
      </div>

      {/* Search Input */}
      <Input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Files Section */}
      <div
        className="overflow-y-auto flex-1"
        style={{ scrollbarWidth: "none" }}
      >
        {currentFiles.map((file, idx) => (
          <div className="mb-3" key={idx}>
            <ProfileProcessCard
              fileData={file}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      )}

      {/* Toggle Button */}
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
