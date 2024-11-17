import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "./ui/card";

interface ApiResponse {
  footprint: string;
}

export default function FootprintTable({ result }: { result: ApiResponse }) {
  const [tableData, setTableData] = useState<string[][]>([]);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(result.footprint, "text/html");
    const rows = Array.from(doc.querySelectorAll("table tr"));

    const data = rows.map((row) =>
      Array.from(row.querySelectorAll("td, th")).map(
        (cell) => cell.textContent?.trim() || ""
      )
    );
    setTableData(data);
  }, [result]);

  if (!tableData.length) return <p>Loading table...</p>;

  return (
    <Card className="w-full px-3 pb-3">
      <CardHeader className="font-bold text-xl">
        Footprint Algorithm Result
      </CardHeader>
      <CardContent className="w-full bg-white rounded">
        <Table>
          <TableHeader>
            <TableRow>
              {tableData[0]?.map((header, index) => (
                <TableHead key={index} className="border text-center">{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.slice(1).map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="border text-center">{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
