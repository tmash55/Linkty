import React from "react";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

interface ClickData {
  date: string;
  clicks: number;
}

interface OverallClicksChartProps {
  data: ClickData[];
  xAxisFormat: string;
}

export const OverallClicksChart: React.FC<OverallClicksChartProps> = ({
  data,
  xAxisFormat,
}) => {
  if (!data || data.length === 0) {
    return <p>No click data available for the chart</p>;
  }

  return (
    <ChartContainer
      config={{
        clicks: {
          label: "Clicks",
          color: "hsl(var(--primary))",
        },
      }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={(value) => format(parseISO(value), xAxisFormat)}
            style={{
              fontSize: "10px",
              fill: "hsl(var(--muted-foreground))",
            }}
            interval={xAxisFormat === "HH:mm" ? 3 : "preserveStartEnd"}
            minTickGap={20}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            style={{
              fontSize: "10px",
              fill: "hsl(var(--muted-foreground))",
            }}
            width={30}
          />
          <ChartTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as ClickData;
                return (
                  <div className="rounded-lg bg-background p-2 shadow-md">
                    <p className="font-semibold">
                      {format(parseISO(data.date), "MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Clicks:{" "}
                      <span className="font-medium text-primary">
                        {data.clicks}
                      </span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
            cursor={{
              stroke: "hsl(var(--muted-foreground))",
              strokeWidth: 1,
            }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#colorClicks)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
