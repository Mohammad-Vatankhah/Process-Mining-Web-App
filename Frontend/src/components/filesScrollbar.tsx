"use client";

import { ChevronsLeft } from "lucide-react";
import React, { Dispatch, useState } from "react";
import { FileData } from "./profilePage";
import ProfileProcessCard from "./profileProcessCard";

export default function FilesScrollbar({
  files,
  selectedFile,
  setSelectedFile,
}: {
  files: FileData[];
  selectedFile: string;
  setSelectedFile: Dispatch<React.SetStateAction<string>>;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`absolute md:relative z-20 flex flex-col px-5 mt-3 py-6 bg-white rounded-tr-lg rounded-br-lg shadow gap-3 h-fit transition-all duration-300 ${
        !isOpen && "ml-[-250px]"
      }`}
    >
      <h1 className="font-bold text-lg">Your Files</h1>
      {files.map((file, idx) => (
        <ProfileProcessCard
          fileData={file}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          key={idx}
        />
      ))}
      <div className="absolute bg-background rounded cursor-pointer right-[-12px] top-[50%] shadow">
        <ChevronsLeft
          className={` transition-transform duration-300 ${
            isOpen ? "rotate-0" : "rotate-180"
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
        />
      </div>
    </div>
  );
}
