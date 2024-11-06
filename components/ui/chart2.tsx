"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";

interface ChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
}

export function BarChart({ data, colors = ["#2563eb"] }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill={colors[0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function PieChart({
  data,
  colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
  colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
