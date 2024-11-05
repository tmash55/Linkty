"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/libs/supabase/client";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Link as LinkIcon,
  BarChart2,
  ArrowUpRight,
  Plus,
  FolderOpen,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  subDays,
  subMonths,
  startOfYear,
  subYears,
  parseISO,
  isWithinInterval,
} from "date-fns";

import { StatCard } from "@/components/folders/StatCard";
import { CustomBarChart } from "@/components/folders/CustomBarChart";
import { LinkTable } from "@/components/folders/LinkTable";
import { OverallClicksChart } from "@/components/analytics/OverallClicksChart";
import { ClicksOverTimeSection } from "@/components/analytics/ClicksOverTimeSection";

const timeRanges = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "3m", label: "Last 3 Months" },
  { value: "ytd", label: "Year to Date" },
  { value: "12m", label: "Last 12 Months" },
  { value: "all", label: "All Time" },
];

interface Stats {
  total_clicks: number;
  os_stats: Record<string, { clicks: number; visitors: number }>;
  browser_stats: Record<string, { clicks: number; visitors: number }>;
  clicks_over_time: Array<{ date: string; clicks: number }>;
}

export default function OverviewPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [links, setLinks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState<Stats>({
    total_clicks: 0,
    os_stats: {},
    browser_stats: {},
    clicks_over_time: [],
  });
  const [xAxisFormat, setXAxisFormat] = useState("MMM d");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const getStartDateAndFormat = (range: string) => {
    const now = new Date();
    let startDate: Date;
    let format: string;
    let interval: "hour" | "day" | "week" | "month" = "day";

    switch (range) {
      case "24h":
        startDate = subDays(now, 1);
        format = "HH:mm";
        interval = "hour";
        break;
      case "7d":
        startDate = subDays(now, 7);
        format = "EEE";
        break;
      case "30d":
        startDate = subDays(now, 30);
        format = "MMM d";
        break;
      case "3m":
        startDate = subMonths(now, 3);
        format = "MMM d";
        interval = "week";
        break;
      case "ytd":
        startDate = startOfYear(now);
        format = "MMM";
        interval = "month";
        break;
      case "12m":
        startDate = subYears(now, 1);
        format = "MMM";
        interval = "month";
        break;
      case "all":
      default:
        startDate = new Date(0);
        format = "MMM yyyy";
        interval = "month";
    }

    return { startDate, format, interval };
  };

  const fetchLinks = async (userId: string) => {
    const { data, error } = await supabase
      .from("shortened_links")
      .select(
        `
        id,
        original_url,
        short_code,
        clicks,
        created_at,
        folder_id,
        domains (
          id,
          domain
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  };

  const fetchFolders = async (userId: string) => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  };

  const fetchStats = async (
    userId: string,
    startDate: string,
    interval: string
  ) => {
    const { data, error } = await supabase.rpc("get_overall_stats", {
      p_user_id: userId,
      p_start_date: startDate,
      p_interval: interval,
    });

    if (error) throw error;
    return data as Stats;
  };

  const fetchOverviewData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("No authenticated user found");
      }

      const userId = userData.user.id;
      const { startDate, format, interval } = getStartDateAndFormat(timeRange);

      setXAxisFormat(format);

      const [linksData, foldersData, statsData] = await Promise.all([
        fetchLinks(userId),
        fetchFolders(userId),
        fetchStats(userId, startDate.toISOString(), interval),
      ]);

      setLinks(linksData);
      setFolders(foldersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching overview data:", error);
      setError("Failed to load overview data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, [timeRange]);

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">Loading....</div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalLinks = links.length;
  const totalFolders = folders.length;
  const totalClicks = stats.total_clicks || 0;

  const prepareChartData = (
    data: Record<string, { clicks: number; visitors: number }> | null,
    metric: "clicks" | "visitors" = "clicks"
  ) => {
    if (!data) return [];
    return Object.entries(data).map(([name, stats]) => ({
      name,
      value: stats[metric],
    }));
  };

  const operatingSystems = prepareChartData(stats.os_stats, "clicks");
  const operatingSystemsVisitors = prepareChartData(stats.os_stats, "visitors");
  const browsers = prepareChartData(stats.browser_stats, "clicks");
  const browsersVisitors = prepareChartData(stats.browser_stats, "visitors");
  const clicksOverTime = stats.clicks_over_time || [];

  const topPerformingLink = links.reduce(
    (max: any, link: any) => (link.clicks > (max?.clicks || 0) ? link : max),
    null
  );

  const SHORT_DOMAIN =
    process.env.NEXT_PUBLIC_SHORT_DOMAIN || "localhost:3000/s";

  return (
    <main className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/folders/new">
                <FolderOpen className="mr-2 h-4 w-4" aria-hidden="true" /> New
                Folder
              </Link>
            </Button>
            <Button asChild>
              <Link href="/links/new">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> New Link
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Links" value={totalLinks} icon={LinkIcon} />
          <StatCard
            title="Total Folders"
            value={totalFolders}
            icon={FolderOpen}
          />
          <StatCard title="Total Clicks" value={totalClicks} icon={BarChart2} />
          {topPerformingLink && (
            <StatCard
              title="Top Performing Link"
              value={`${topPerformingLink.clicks || 0} clicks`}
              description={`${
                topPerformingLink.domains?.domain || SHORT_DOMAIN
              }/${topPerformingLink.short_code}`}
              icon={ArrowUpRight}
            />
          )}
        </div>

        <ClicksOverTimeSection data={clicksOverTime} />

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Operating Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="clicks">
                <TabsList className="grid w-full grid-cols-2 h-8 mb-4">
                  <TabsTrigger value="clicks" className="text-xs">
                    Clicks
                  </TabsTrigger>
                  <TabsTrigger value="visitors" className="text-xs">
                    Visitors
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="clicks">
                  <CustomBarChart
                    data={operatingSystems}
                    title="Operating Systems"
                    showVisitors={false}
                  />
                </TabsContent>
                <TabsContent value="visitors">
                  <CustomBarChart
                    data={operatingSystemsVisitors}
                    title="Operating Systems"
                    showVisitors={true}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Browsers</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="clicks">
                <TabsList className="grid w-full grid-cols-2 h-8 mb-4">
                  <TabsTrigger value="clicks" className="text-xs">
                    Clicks
                  </TabsTrigger>
                  <TabsTrigger value="visitors" className="text-xs">
                    Visitors
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="clicks">
                  <CustomBarChart
                    data={browsers}
                    title="Browsers"
                    showVisitors={false}
                  />
                </TabsContent>
                <TabsContent value="visitors">
                  <CustomBarChart
                    data={browsersVisitors}
                    title="Browsers"
                    showVisitors={true}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Links</CardTitle>
          </CardHeader>
          <CardContent>
            <LinkTable links={links} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
