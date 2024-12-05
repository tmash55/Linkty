"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsHeaderProps {
  onTimeFrameChange: (timeFrame: string) => void;
  selectedTimeFrame: string;
}

export function AnalyticsHeader({
  onTimeFrameChange,
  selectedTimeFrame,
}: AnalyticsHeaderProps) {
  return (
    <Select onValueChange={onTimeFrameChange} value={selectedTimeFrame}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time frame" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="24h">Last 24 hours</SelectItem>
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="30d">Last 30 days</SelectItem>
        <SelectItem value="90d">Last 90 days</SelectItem>
        <SelectItem value="6m">Last 6 months</SelectItem>
        <SelectItem value="12m">Last 12 months</SelectItem>
        <SelectItem value="ytd">Year to date</SelectItem>
        <SelectItem value="all">All time</SelectItem>
      </SelectContent>
    </Select>
  );
}
