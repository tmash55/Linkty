"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart } from "@/components/ui/bar-chart";
import { LineChart } from "@/components/ui/line-chart";
import { createClient } from "@/libs/supabase/client";
import { Loader, LinkIcon } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  async function fetchAnalyticsData() {
    setIsLoading(true);
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
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (
    !analyticsData ||
    (!analyticsData.click_data?.length &&
      !analyticsData.top_links?.length &&
      !analyticsData.device_data?.length &&
      !analyticsData.browser_data?.length)
  ) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-screen text-center">
        <LinkIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold mb-2">No Analytics Data Yet</h1>
        <p className="text-xl text-gray-600 mb-6">
          Create your first link to start seeing analytics!
        </p>
        <Button asChild>
          <Link href="/links/new">Create Your First Link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>

      <div className="mb-4 flex justify-end items-center">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={(analyticsData.click_data || []).map((d: any) => ({
                date: d.date,
                value: d.clicks,
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
              data={(analyticsData.top_links || []).map((d: any) => ({
                name: d.short_code,
                value: d.clicks,
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
              data={(analyticsData.device_data || []).map((d: any) => ({
                name: d.device_type,
                value: d.clicks,
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
              data={(analyticsData.browser_data || []).map((d: any) => ({
                name: d.browser,
                value: d.clicks,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
