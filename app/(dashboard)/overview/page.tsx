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
} from "lucide-react";

import { StatCard } from "@/components/folders/StatCard";
import { CustomBarChart } from "@/components/folders/CustomBarChart";
import { LinkTable } from "@/components/folders/LinkTable";
import { OverallClicksChart } from "@/components/analytics/OverallClicksChart";

export default function OverviewPage() {
  const [overviewData, setOverviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchOverviewData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all links (including those in folders)
      const { data: links, error: linksError } = await supabase.from(
        "shortened_links"
      ).select(`
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
        `);

      if (linksError) throw linksError;

      // Fetch all folders
      const { data: folders, error: foldersError } = await supabase
        .from("folders")
        .select("*");

      if (foldersError) throw foldersError;

      // Fetch overall stats
      const { data: stats, error: statsError } = await supabase.rpc(
        "get_overall_stats"
      );

      if (statsError) throw statsError;

      console.log("Fetched stats:", stats); // Log the fetched stats

      setOverviewData({
        links: links || [],
        folders: folders || [],
        stats: stats || {},
      });
    } catch (error) {
      console.error("Error fetching overview data:", error);
      setError("Failed to load overview data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">Loading...</div>
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

  const { links, folders, stats } = overviewData;

  const totalLinks = links.length;
  const totalFolders = folders.length;
  const totalClicks = links.reduce(
    (sum: number, link: any) => sum + (link.clicks || 0),
    0
  );

  const prepareChartData = (data: Record<string, number>) => {
    return Object.entries(data || {}).map(([name, value]) => ({ name, value }));
  };

  const operatingSystems = prepareChartData(stats.os_stats || {});
  const browsers = prepareChartData(stats.browser_stats || {});
  const clicksOverTime = stats.clicks_over_time || [];

  console.log("Clicks over time data:", clicksOverTime); // Log the clicks over time data

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
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/folders/new">
              <FolderOpen className="mr-2 h-4 w-4" aria-hidden="true" /> New
              Folder
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/links/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> New Link
            </Link>
          </Button>
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

        {clicksOverTime.length > 0 ? (
          <OverallClicksChart data={clicksOverTime} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Folder Clicks Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No click data available for the time chart</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
          <CustomBarChart data={operatingSystems} title="Operating Systems" />
          <CustomBarChart data={browsers} title="Browsers" />
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
