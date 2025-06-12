"use client";

import React from "react";

interface SimpleBarChartProps {
  className?: string;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ className }) => {
  // Mock data for visualization
  const data = [
    { month: "Jan", value: 30 },
    { month: "Feb", value: 45 },
    { month: "Mar", value: 60 },
    { month: "Apr", value: 80 },
    { month: "May", value: 95 },
    { month: "Jun", value: 70 },
  ];

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className={`h-64 ${className}`}>
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((item) => (
          <div key={item.month} className="flex flex-col items-center flex-1">
            <div className="w-full flex flex-col items-center">
              <div
                className="w-8 bg-blue-600 rounded-t-sm transition-all duration-300 hover:bg-blue-700"
                style={{
                  height: `${(item.value / maxValue) * 180}px`,
                  minHeight: "8px",
                }}
              />
              <div className="mt-2 text-xs text-gray-500 font-medium">
                {item.month}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleBarChart;
