"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { eachDayOfInterval, format, parseISO } from "date-fns";
import { LinkClicksAreaChart } from "./LinkClicksAreaChart";

interface ClickData {
  date: string;
  clicks: number;
}

interface LinkClicksChartProps {
  data: ClickData[];
  timeFilter: string;
}

export function LinkClicksChart({ data, timeFilter }: LinkClicksChartProps) {
  const xAxisFormat = useMemo(() => {
    switch (timeFilter) {
      case "7":
        return "EEE";
      case "30":
        return "MMM d";
      default:
        return "MMM d";
    }
  }, [timeFilter]);

  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    const startDate = parseISO(data[0].date);
    const endDate = parseISO(data[data.length - 1].date);

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return allDays.map((day) => {
      const formattedDate = format(day, "yyyy-MM-dd");
      const dataPoint = data.find((d) => d.date === formattedDate);
      return {
        date: formattedDate,
        clicks: dataPoint ? dataPoint.clicks : 0,
      };
    });
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clicks Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <LinkClicksAreaChart data={chartData} xAxisFormat={xAxisFormat} />
      </CardContent>
    </Card>
  );
}
