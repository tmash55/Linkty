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
  Globe,
  Loader,
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

  // Icon components
  const ChromeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" y1="8" x2="12" y2="8" />
      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
  );

  const FirefoxIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M14.5 8.5c-.223.1-.457.185-.7.254C13.767 5.962 12 4 12 4s-1.767 1.962-1.8 4.754c-.243-.069-.477-.154-.7-.254C6.5 10 7 14 7 14s2 2.5 5 2.5 5-2.5 5-2.5 .5-4-2.5-5.5z" />
    </svg>
  );

  const SafariIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M12 7l5 5-5 5-5-5z" />
    </svg>
  );

  const EdgeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <path d="M3 8v8a9.38 9.38 0 0 0 9 5c5 0 9-3.58 9-8V8c0-4.42-4-8-9-8a9.38 9.38 0 0 0-9 5" />
      <path d="M10 19.5V12" />
      <path d="M14 19.5V12" />
      <path d="M10 12h4" />
    </svg>
  );

  const WindowsIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <path d="M3 12h18" />
      <path d="M12 3v18" />
    </svg>
  );

  const AppleIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
      <path d="M10 2c1 .5 2 2 2 5" />
    </svg>
  );

  const LinuxIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <path d="M12 2a7 7 0 0 0-7 7v6a7 7 0 0 0 14 0V9a7 7 0 0 0-7-7Z" />
      <path d="M15.6 20H8.4a2 2 0 0 1-1.6-3.2L9 14" />
      <path d="M15 14l2.2 2.8a2 2 0 0 1-1.6 3.2" />
      <path d="M9 6h6" />
      <path d="M9 10h6" />
    </svg>
  );

  const AndroidIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <path d="M5 16V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12" />
      <path d="M7 20h10" />
      <path d="M9 16v4" />
      <path d="M15 16v4" />
      <path d="M12 2v2" />
      <path d="M9 7h6" />
    </svg>
  );

  const getBrowserIcon = (browserName: string) => {
    const lowerCaseName = browserName.toLowerCase();
    if (lowerCaseName.includes("chrome")) return <ChromeIcon />;
    if (lowerCaseName.includes("firefox")) return <FirefoxIcon />;
    if (lowerCaseName.includes("safari")) return <SafariIcon />;
    if (lowerCaseName.includes("edge")) return <EdgeIcon />;
    return <Globe className="h-4 w-4 text-muted-foreground" />;
  };

  const getOsIcon = (osName: string) => {
    const lowerCaseName = osName.toLowerCase();
    if (lowerCaseName.includes("windows")) return <WindowsIcon />;
    if (lowerCaseName.includes("mac") || lowerCaseName.includes("ios"))
      return <AppleIcon />;
    if (lowerCaseName.includes("linux")) return <LinuxIcon />;
    if (lowerCaseName.includes("android")) return <AndroidIcon />;
    return <Globe className="h-4 w-4 text-muted-foreground" />;
  };

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
      <div className="container mx-auto py-10 flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
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
      icon: metric === "clicks" ? getBrowserIcon(name) : getOsIcon(name),
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
    <main className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/folders/new">
              <FolderOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              New Folder
            </Link>
          </Button>
          <Button asChild>
            <Link href="/links/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              New Link
            </Link>
          </Button>
        </div>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Clicks Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ClicksOverTimeSection data={clicksOverTime} />
        </CardContent>
      </Card>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Operating Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="clicks">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="clicks">Clicks</TabsTrigger>
                <TabsTrigger value="visitors">Visitors</TabsTrigger>
              </TabsList>
              <TabsContent value="clicks" className="pt-4">
                <CustomBarChart
                  data={operatingSystems}
                  title="Operating Systems"
                  showVisitors={false}
                />
              </TabsContent>
              <TabsContent value="visitors" className="pt-4">
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
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="clicks">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="clicks">Clicks</TabsTrigger>
                <TabsTrigger value="visitors">Visitors</TabsTrigger>
              </TabsList>
              <TabsContent value="clicks" className="pt-4">
                <CustomBarChart
                  data={browsers}
                  title="Browsers"
                  showVisitors={false}
                />
              </TabsContent>
              <TabsContent value="visitors" className="pt-4">
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
    </main>
  );
}
