import React from "react";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Pagination({
  currentPage,
  setCurrentPage,
  totalPages,
}: {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}) {
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  return (
    <div className="flex justify-center mt-4">
      <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
        <ArrowLeft size={18} />
      </Button>
      <span className="px-4 py-2">{`Page ${currentPage} of ${totalPages}`}</span>
      <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
        <ArrowRight size={18} />
      </Button>
    </div>
  );
}
