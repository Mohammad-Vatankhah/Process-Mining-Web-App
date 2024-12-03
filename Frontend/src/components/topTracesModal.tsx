"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProcessTrace from "./processTrace";
import { useQuery } from "@tanstack/react-query";
import PMapi from "@/API/pmAPI";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import toast from "react-hot-toast";

export function TopTracesModal({ filename }: { filename: string }) {
  const [n, setN] = useState(5);

  useEffect(() => {
    setN(5);
  }, [filename]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["topTraces", { filename }],
    queryFn: () => PMapi.topProcesses(filename, n),
  });

  const handleRefetch = () => {
    if (n > data?.data?.unique_traces) {
      toast.error("Invalid Input");
      return;
    }
    refetch();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Inspect Top Traces</Button>
      </DialogTrigger>
      <DialogContent className="max-w-fit overflow-auto">
        <DialogHeader>
          <div className="flex max-w-full items-center gap-2">
            <DialogTitle>Top Traces</DialogTitle>
            <Input
              type="number"
              max={data?.data?.unique_traces}
              className="w-24"
              value={n}
              onChange={(e) => setN(parseInt(e.target.value))}
            />
            <span>Max: {data?.data?.unique_traces}</span>
            <Button onClick={handleRefetch}>Submit</Button>
          </div>
        </DialogHeader>
        <div>
          {isLoading || isFetching ? (
            <div className="h-[400px] lg:w-[1000px]">Loading...</div>
          ) : (
            <ProcessTrace
              topTraces={data?.data?.top_traces}
              percentages={data?.data?.percentages}
              count={data?.data?.count}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
