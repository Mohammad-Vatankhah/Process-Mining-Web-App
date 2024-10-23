import { Image } from "antd";
import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";

export default function MinerResult({
  result,
  algorithm,
}: {
  result: { image_base64: string };
  algorithm: string;
}) {
  return (
    <Card>
      <CardHeader className="font-bold text-xl">{`${algorithm} Algorithm Result`}</CardHeader>
      <CardContent>
        <Image
          src={result.image_base64}
          alt="alphaMinerResult"
          placeholder={
            <Image
              preview={false}
              src={result.image_base64}
              width={200}
              alt="preview"
            />
          }
        />
      </CardContent>
    </Card>
  );
}
