"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function DfgResult({
  result,
}: {
  result: Record<string, number> | null;
}) {
  const [totalCount, setTotalCount] = useState(0);

  const rows = result
    ? Object.entries(result).map(([transition, count]) => {
        const [from, to] = transition.replace(/[()']/g, "").split(", ");
        return { from, to, count };
      })
    : [];

  useEffect(() => {
    if (result) {
      const total = Object.values(result).reduce(
        (sum, count) => sum + count,
        0
      );
      setTotalCount(total);
    }
  }, [result]);

  return (
    <Card className="w-full">
      <CardHeader className="font-bold text-xl">
        DFG Algorithm Result
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={rows} totalCount={totalCount} />
      </CardContent>
    </Card>
  );
}
