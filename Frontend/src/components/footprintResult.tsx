import { useEffect, useState } from "react";
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
    <Card className="min-w-full px-3 pb-3">
      <CardHeader className="font-bold text-xl">
        Footprint Algorithm Result
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[450px] border rounded bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {tableData[0].map((header, index) => (
                  <th
                    key={index}
                    className="border px-2 py-1 text-left bg-gray-100 sticky top-0 z-10 font-normal text-sm"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.slice(1).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="group hover:bg-gray-200 transition-all duration-300"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`border px-2 py-1 text-sm ${
                        cellIndex === 0 ? "sticky left-0 bg-gray-100 z-9" : ""
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
