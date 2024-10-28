"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/libs/supabase/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ClicksOverTimeChartClient from "@/components/analytics/ClicksOverTime";
import { CustomBarChart } from "@/components/folders/CustomBarChart";

interface LinkData {
  id: string;
  short_code: string;
  original_url: string;
  // Add other fields as necessary
}

interface ClickData {
  date: string;
  clicks: number;
}

interface PieChartData {
  name: string;
  value: number;
}

export default function LinkAnalyticsPage() {
  const { id } = useParams();
  const [link, setLink] = useState<LinkData | null>(null);
  const [clicksOverTime, setClicksOverTime] = useState<ClickData[]>([]);
  const [referrers, setReferrers] = useState<PieChartData[]>([]);
  const [devices, setDevices] = useState<PieChartData[]>([]);
  const [browsers, setBrowsers] = useState<PieChartData[]>([]);
  const [operatingSystems, setOperatingSystems] = useState<PieChartData[]>([]);
  const [timeFilter, setTimeFilter] = useState("7");
  const supabase = createClient();

  useEffect(() => {
    fetchLinkData();
    fetchAnalytics();
  }, [id, timeFilter]);

  async function fetchLinkData() {
    const { data, error } = await supabase
      .from("shortened_links")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching link:", error);
    } else {
      setLink(data);
    }
  }

  async function fetchAnalytics() {
    const timeAgo = new Date();
    timeAgo.setDate(timeAgo.getDate() - parseInt(timeFilter));

    // Fetch clicks over time
    const { data: clicksData, error: clicksError } = await supabase
      .from("link_clicks")
      .select("created_at")
      .eq("link_id", id)
      .gte("created_at", timeAgo.toISOString())
      .order("created_at", { ascending: true });

    if (clicksData && !clicksError) {
      const clicksByDay = clicksData.reduce((acc, click) => {
        const date = new Date(click.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setClicksOverTime(
        Object.entries(clicksByDay).map(([date, clicks]) => ({ date, clicks }))
      );
    }

    // Fetch referrers
    const { data: referrerData, error: referrerError } = await supabase
      .from("link_clicks")
      .select("referrer")
      .eq("link_id", id)
      .gte("created_at", timeAgo.toISOString());

    if (referrerData && !referrerError) {
      const referrerCounts = referrerData.reduce((acc, click) => {
        const referrer = click.referrer || "Direct";
        acc[referrer] = (acc[referrer] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setReferrers(
        Object.entries(referrerCounts).map(([name, value]) => ({ name, value }))
      );
    }

    // Fetch devices
    const { data: deviceData, error: deviceError } = await supabase
      .from("link_clicks")
      .select("device_type")
      .eq("link_id", id)
      .gte("created_at", timeAgo.toISOString());

    if (deviceData && !deviceError) {
      const deviceCounts = deviceData.reduce((acc, click) => {
        acc[click.device_type] = (acc[click.device_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setDevices(
        Object.entries(deviceCounts).map(([name, value]) => ({ name, value }))
      );
    }

    // Fetch browsers
    const { data: browserData, error: browserError } = await supabase
      .from("link_clicks")
      .select("browser")
      .eq("link_id", id)
      .gte("created_at", timeAgo.toISOString());

    if (browserData && !browserError) {
      const browserCounts = browserData.reduce((acc, click) => {
        acc[click.browser] = (acc[click.browser] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setBrowsers(
        Object.entries(browserCounts).map(([name, value]) => ({ name, value }))
      );
    }

    // Fetch operating systems
    const { data: osData, error: osError } = await supabase
      .from("link_clicks")
      .select("operating_system")
      .eq("link_id", id)
      .gte("created_at", timeAgo.toISOString());

    if (osData && !osError) {
      const osCounts = osData.reduce((acc, click) => {
        acc[click.operating_system] = (acc[click.operating_system] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setOperatingSystems(
        Object.entries(osCounts).map(([name, value]) => ({ name, value }))
      );
    }
  }

  if (!link) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Analytics for {link.short_code}
      </h1>
      <div className="mb-4">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClicksOverTimeChartClient data={clicksOverTime} />
        <CustomBarChart title="Referrers" data={referrers} />
        <CustomBarChart title="Devices" data={devices} />
        <CustomBarChart title="Browsers" data={browsers} />
        <CustomBarChart title="Operating Systems" data={operatingSystems} />
      </div>
    </div>
  );
}
