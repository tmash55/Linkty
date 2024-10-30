import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp } from "lucide-react";

interface CustomBarChartProps {
  data: { name: string; value: number }[];
  title: string;
  showVisitors?: boolean;
}

export const CustomBarChart: React.FC<CustomBarChartProps> = ({
  data,
  title,
  showVisitors = false,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className="space-y-1">
      {sortedData.map((item) => {
        const percentage = ((item.value / total) * 100).toFixed(0);
        const barWidth = `${(item.value / maxValue) * 100}%`;
        return (
          <div key={item.name} className="relative">
            <div
              className="absolute inset-0 bg-muted rounded-sm"
              style={{ width: barWidth }}
            />
            <div className="relative flex items-center justify-between py-2 z-10">
              <div className="flex items-center space-x-2">
                <div className="w-[120px] truncate text-sm">{item.name}</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium">
                  {item.value.toLocaleString()}{" "}
                  {showVisitors ? "visitors" : "clicks"}
                </div>
                <div className="text-sm text-muted-foreground w-[40px] text-right">
                  {percentage}%
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
