"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export type DFG = {
  from: string;
  to: string;
  count: number;
};

export const columns: ColumnDef<DFG>[] = [
  {
    accessorKey: "from",
    header: "From",
  },
  {
    accessorKey: "to",
    header: "To",
  },
  {
    accessorKey: "count",
    header: ({ column }) => {
      return (
        <div
        className="flex flex-row items-center cursor-pointer w-full hover:bg-slate-200 p-2 rounded"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Count
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      );
    },
  },
];
