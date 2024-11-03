import React, { Dispatch } from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { FileData } from "./profilePage";

export default function ProfileProcessCard({
  fileData,
  selectedFile,
  setSelectedFile,
}: {
  fileData: FileData;
  selectedFile: string;
  setSelectedFile: Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <Card className="flex overflow-hidden flex-col border-none">
      <CardHeader>
        <CardTitle>{fileData.original_filename}</CardTitle>
        <CardDescription>
          {new Date(fileData.uploaded_at).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        {fileData.saved_filename === selectedFile ? (
          <Button size="lg" className="w-full" variant="outline" disabled>
            Selected
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full"
            onClick={() => setSelectedFile(fileData.saved_filename)}
          >
            Select
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
