import React from "react";

const getDynamicColor = (index: number): string => {
  const hue = (index * 137.508) % 360; // Golden angle approximation
  return `hsl(${hue}, 70%, 50%)`; // HSL with fixed saturation and lightness
};

type ProcessVariantProps = {
  topTraces: string[][];
  percentages: number[];
  count: number[];
};

const ProcessTrace: React.FC<ProcessVariantProps> = ({
  topTraces,
  percentages,
  count,
}) => {
  const uniqueEvents = Array.from(new Set(topTraces.flat()));
  const eventColors = uniqueEvents.reduce((acc, event, index) => {
    acc[event.trim()] = getDynamicColor(index);
    return acc;
  }, {} as { [key: string]: string });

  return (
    <div className="flex flex-wrap gap-4 max-w-fit">
      <div className="flex flex-col gap-5 max-w-fit overflow-x-auto max-h-80">
        {topTraces.map((variant, index) => (
          <div key={index} className="flex items-center">
            <span className="mr-1">{index + 1}</span>
            {variant.map((event, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: eventColors[event.trim()] || "#ccc",
                  padding:
                    idx === 0
                      ? "10px 20px 10px 10px"
                      : idx < variant.length - 1
                      ? "10px 20px 10px 25px"
                      : "10px 10px 10px 25px",
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
            <span className="ml-3 whitespace-nowrap">{`${percentages[index]}% (${count[index]})`}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 border-t pt-2 max-w-full">
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
            <span className="whitespace-nowrap">{event}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessTrace;
