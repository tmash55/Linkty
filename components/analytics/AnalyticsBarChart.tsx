"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  FaWindows,
  FaApple,
  FaLinux,
  FaAndroid,
  FaChrome,
} from "react-icons/fa";
import { BsWindows, BsApple } from "react-icons/bs";
import { AiFillAndroid } from "react-icons/ai";
import { SiLinux } from "react-icons/si";
import { MdSmartphone, MdTablet, MdLaptop } from "react-icons/md";

interface AnalyticsData {
  name: string;
  value: number;
}

interface AnalyticsBarChartProps {
  title: string;
  data: AnalyticsData[];
  valueLabel?: string;
}

const getIcon = (name: string) => {
  switch (name) {
    case "Windows":
      return <BsWindows className="w-4 h-4" />;
    case "Mac OS":
      return <BsApple className="w-4 h-4" />;
    case "Chrome":
      return <FaChrome className="w-4 h-4" />;
    default:
      return null;
  }
};

const CustomTooltip = ({ active, payload, label, valueLabel }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded p-2 shadow-lg">
        <p className="font-semibold">{label}</p>
        <p>
          {valueLabel || "Value"}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsBarChart({
  title,
  data,
  valueLabel = "Visitors",
}: AnalyticsBarChartProps) {
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const sortedData = [...data].sort((a, b) =>
    sortOrder === "desc" ? b.value - a.value : a.value - b.value
  );

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">
          {title}
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="ml-2 text-muted-foreground hover:text-foreground"
            aria-label={
              sortOrder === "desc" ? "Sort ascending" : "Sort descending"
            }
          >
            {sortOrder === "desc" ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronUp size={16} />
            )}
          </button>
        </CardTitle>
        <div className="text-right">
          <p className="text-2xl font-bold">{totalValue}</p>
          <p className="text-sm text-muted-foreground">Total {valueLabel}</p>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="horizontal"
            data={sortedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              dataKey="name"
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x},${y})`}>
                  <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
                    {payload.value}
                  </text>
                  <foreignObject width={20} height={20} x={-10} y={-30}>
                    {getIcon(payload.value)}
                  </foreignObject>
                </g>
              )}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip valueLabel={valueLabel} />} />
            <Bar dataKey="value" barSize={40} radius={[4, 4, 0, 0]}>
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(var(--chart-${index + 1}))`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
