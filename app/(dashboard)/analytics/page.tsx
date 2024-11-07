"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart } from "@/components/ui/bar-chart";
import { LineChart } from "@/components/ui/line-chart";
import { createClient } from "@/libs/supabase/client";
import { Loader } from "lucide-react";

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [dataType, setDataType] = useState("clicks");
  const supabase = createClient();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  async function fetchAnalyticsData() {
    const endDate = new Date();
    const startDate = new Date(
      endDate.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000
    );

    const { data, error } = await supabase.rpc("get_visitor_stats", {
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
    });

    if (error) {
      console.error("Error fetching analytics data:", error);
    } else {
      setAnalyticsData(data);
    }
  }

  if (!analyticsData)
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>

      <div className="mb-4 flex justify-between items-center">
        <Tabs value={dataType} onValueChange={setDataType}>
          <TabsList>
            <TabsTrigger value="clicks">Clicks</TabsTrigger>
            <TabsTrigger value="visitors">Visitors</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {dataType === "clicks" ? "Clicks" : "Visitors"} Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={analyticsData.click_data.map((d: any) => ({
                date: d.date,
                value: dataType === "clicks" ? d.clicks : d.visitors,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Links</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analyticsData.top_links.map((d: any) => ({
                name: d.short_code,
                value: dataType === "clicks" ? d.clicks : d.visitors,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analyticsData.device_data.map((d: any) => ({
                name: d.device_type,
                value: dataType === "clicks" ? d.clicks : d.visitors,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analyticsData.browser_data.map((d: any) => ({
                name: d.browser,
                value: dataType === "clicks" ? d.clicks : d.visitors,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
