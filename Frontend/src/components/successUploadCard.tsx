import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { BadgeCheck } from "lucide-react";

export default function SuccessUploadCard({
  fileName,
}: {
  fileName: string | undefined;
}) {
  return (
    <Card className="min-w-fit h-fit flex flex-col justify-center items-center md:items-start">
      <CardHeader className="text-xl font-bold">
        <div className="flex items-center gap-2">
          <BadgeCheck size={32} strokeWidth={3} className="text-green-500" />
          Your file uploaded successfully
        </div>
      </CardHeader>
      <CardContent>
        <b className="m-0">
          <strong>File Name:</strong> {fileName}
        </b>
      </CardContent>
    </Card>
  );
}
