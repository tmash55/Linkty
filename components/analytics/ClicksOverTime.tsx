"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";

interface ClickData {
  date: string;
  clicks: number;
}

interface ClicksOverTimeChartProps {
  data: ClickData[];
}

export default function ClicksOverTimeChartClient({
  data,
}: ClicksOverTimeChartProps) {
  const maxClicks = Math.max(...data.map((item) => item.clicks));
  const yAxisTicks = Array.from({ length: 5 }, (_, i) =>
    Math.round((i * maxClicks) / 4)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clicks Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              domain={[0, "dataMax"]}
              allowDecimals={false}
              ticks={yAxisTicks}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
              formatter={(value) => [parseInt(value as string), "Clicks"]}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              itemStyle={{ color: "hsl(var(--primary))" }}
            />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorClicks)"
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
