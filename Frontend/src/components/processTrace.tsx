// components/ProcessVariants.tsx
import React from "react";

// دریافت رنگ تصادفی برای هر رویداد
const getRandomColor = (event: string): string => {
  const hash = [...event].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F1C40F",
    "#E74C3C",
    "#2ECC71",
    "#9B59B6",
    "#FF33A1",
    "#A1FF33",
    "#33A1FF",
  ];
  return colors[hash % colors.length];
};

type ProcessVariantProps = {
  topTracesString: string;
};

const ProcessTrace: React.FC<ProcessVariantProps> = ({ topTracesString }) => {
  // پارس کردن رشته به آرایه
  const parsedTraces = JSON.parse(
    topTracesString.replace(/\(/g, "[").replace(/\)/g, "]").replace(/'/g, '"')
  ) as string[][];

  // استخراج رویدادها و اختصاص رنگ
  const uniqueEvents = Array.from(new Set(parsedTraces.flat()));
  const eventColors = uniqueEvents.reduce((acc, event) => {
    acc[event.trim()] = getRandomColor(event);
    return acc;
  }, {} as { [key: string]: string });

  return (
    <div>
      <h2>Top Process Variants</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {parsedTraces.map((variant, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center" }}>
            {variant.map((event, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: eventColors[event.trim()] || "#ccc",
                  padding:
                    idx === 0 ? "10px 20px 10px 10px" :
                    idx < variant.length - 1 ?
                    "10px 20px 10px 25px":
                    "10px 10px 10px 25px",
                  borderRadius: "5px",
                  color: "#fff",
                  fontWeight: "bold",
                  marginRight: idx < variant.length - 1 ? "-35px" : "0",
                  clipPath:
                    idx === 0
                      ? "polygon(75% 0%, 85% 50%, 75% 100%, 0% 100%, 0 50%, 0% 0%)"
                      : idx < variant.length - 1
                      ? "polygon(75% 0%, 85% 50%, 75% 100%, 0% 100%, 10% 50%, 0% 0%)"
                      : "polygon(100% 0, 100% 50%, 100% 100%, 0% 100%, 10% 50%, 0% 0%)",
                }}
                className="w-40 truncate"
              >
                {event}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <h3>Legend</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {uniqueEvents.map((event) => (
          <div
            key={event}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div
              style={{
                backgroundColor: eventColors[event],
                width: "20px",
                height: "20px",
                borderRadius: "3px",
              }}
            ></div>
            <span>{event}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessTrace;
