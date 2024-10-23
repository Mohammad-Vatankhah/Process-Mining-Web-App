import React from "react";
import { Card } from "./ui/card";
import { Upload } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function UploadCard({
  handleFileChange,
  selectedFile,
  handleFileUpload,
  uploading,
}: {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | null;
  handleFileUpload: () => void;
  uploading: boolean;
}) {
  return (
    <div className="container mx-auto py-16 px-4">
      <Card className="p-8 max-w-lg mx-auto text-center shadow-lg">
        <h2 className="text-3xl font-semibold mb-6">Upload Event Log</h2>
        <div className="flex flex-col items-center justify-center">
          <label className="w-full cursor-pointer flex items-center justify-center p-6 bg-gray-100 border border-dashed border-primary rounded-lg hover:bg-gray-200 transition-colors">
            <div className="text-center flex flex-col justify-center items-center">
              <Upload className="h-10 w-10 text-gray-500" />
              <p className="mt-2 text-gray-700">Click to select your file</p>
            </div>
            <Input
              type="file"
              accept=".csv,.xes"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        {selectedFile && (
          <div className="mt-4 text-left">
            <p className="text-gray-700">
              Selected file:{" "}
              <span className="font-semibold">{selectedFile.name}</span>
            </p>
          </div>
        )}

        <Button
          onClick={handleFileUpload}
          className="mt-6 w-full"
          disabled={!selectedFile || uploading}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
      </Card>
    </div>
  );
}
