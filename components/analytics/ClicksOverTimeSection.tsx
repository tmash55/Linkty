"use client";

import React, { useState, useEffect } from "react";
import { OverallClicksChart } from "./OverallClicksChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  subDays,
  subMonths,
  startOfYear,
  subYears,
  parseISO,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachHourOfInterval,
  format,
  addDays,
  addWeeks,
  addMonths,
  addHours,
  endOfDay,
  startOfHour,
  endOfHour,
  isWithinInterval,
} from "date-fns";

interface ClickData {
  date: string;
  clicks: number;
}

interface ClicksOverTimeSectionProps {
  data: ClickData[];
}

const timeRanges = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "3m", label: "Last 3 Months" },
  { value: "ytd", label: "Year to Date" },
  { value: "12m", label: "Last 12 Months" },
  { value: "all", label: "All Time" },
];

export const ClicksOverTimeSection: React.FC<ClicksOverTimeSectionProps> = ({
  data,
}) => {
  const [timeRange, setTimeRange] = useState("30d");
  const [filteredData, setFilteredData] = useState<ClickData[]>([]);
  const [xAxisFormat, setXAxisFormat] = useState<string>("MMM d");

  useEffect(() => {
    const filterData = () => {
      const now = new Date();
      let startDate: Date;
      let interval: "hour" | "day" | "week" | "month" = "day";

      switch (timeRange) {
        case "24h":
          startDate = subDays(now, 1);
          interval = "hour";
          setXAxisFormat("HH:mm");
          break;
        case "7d":
          startDate = subDays(now, 7);
          setXAxisFormat("EEE");
          break;
        case "30d":
          startDate = subDays(now, 30);
          setXAxisFormat("MMM d");
          break;
        case "3m":
          startDate = subMonths(now, 3);
          interval = "week";
          setXAxisFormat("MMM d");
          break;
        case "ytd":
          startDate = startOfYear(now);
          interval = "month";
          setXAxisFormat("MMM");
          break;
        case "12m":
          startDate = subYears(now, 1);
          interval = "month";
          setXAxisFormat("MMM");
          break;
        case "all":
        default:
          startDate = new Date(
            Math.min(...data.map((item) => new Date(item.date).getTime()))
          );
          interval = "month";
          setXAxisFormat("MMM yyyy");
      }

      // Parse all click data dates once
      const parsedClickData = data.map((item) => ({
        ...item,
        parsedDate: parseISO(item.date),
      }));

      let datePoints: Date[];
      switch (interval) {
        case "hour":
          datePoints = eachHourOfInterval({ start: startDate, end: now });
          break;
        case "day":
          datePoints = eachDayOfInterval({ start: startDate, end: now });
          break;
        case "week":
          datePoints = eachWeekOfInterval({ start: startDate, end: now });
          break;
        case "month":
          datePoints = eachMonthOfInterval({ start: startDate, end: now });
          break;
      }

      const aggregatedData = datePoints.map((date) => {
        let intervalStart = date;
        let intervalEnd: Date;

        switch (interval) {
          case "hour":
            intervalEnd = addHours(date, 1);
            break;
          case "day":
            intervalEnd = endOfDay(date);
            break;
          case "week":
            intervalEnd = addWeeks(date, 1);
            break;
          case "month":
            intervalEnd = addMonths(date, 1);
            break;
        }

        const relevantClicks = parsedClickData.filter((item) =>
          isWithinInterval(item.parsedDate, {
            start: intervalStart,
            end: intervalEnd,
          })
        );

        const totalClicks = relevantClicks.reduce(
          (sum, item) => sum + item.clicks,
          0
        );

        return {
          date: format(date, "yyyy-MM-dd HH:mm:ss"),
          clicks: totalClicks,
        };
      });

      setFilteredData(aggregatedData);
    };

    if (data.length > 0) {
      filterData();
    }
  }, [timeRange, data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Clicks Over Time</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <OverallClicksChart data={filteredData} xAxisFormat={xAxisFormat} />
      </CardContent>
    </Card>
  );
};
