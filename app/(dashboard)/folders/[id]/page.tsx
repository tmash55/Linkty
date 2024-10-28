"use client";

import { useParams } from "next/navigation";
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
} from "lucide-react";

import { QuickAddLink } from "@/components/folders/QuickAddLink";
import { StatCard } from "@/components/folders/StatCard";
import { CustomBarChart } from "@/components/folders/CustomBarChart";
import { LinkTable } from "@/components/folders/LinkTable";
import { FolderClicksOverTimeChart } from "@/components/folders/FolderClicksOverTime";

export default function FolderPage() {
  const params = useParams();
  const folderId = params.id as string;
  const [folderData, setFolderData] = useState<any>(null);
  const [domains, setDomains] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchFolderData = async () => {
    if (!folderId) {
      setError("No folder ID provided");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("folders")
      .select(
        `
        *,
        shortened_links (
          id,
          original_url,
          short_code,
          clicks,
          created_at,
          domains (
            id,
            domain
          )
        )
      `
      )
      .eq("id", folderId)
      .single();

    if (error || !data) {
      setError("Folder not found");
    } else {
      setFolderData(data);
      fetchFolderStats(
        data.shortened_links.map((link: { id: any }) => link.id)
      );
    }

    setIsLoading(false);
  };

  const fetchDomains = async () => {
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .order("domain");

    if (error) {
      console.error("Error fetching domains:", error);
    } else {
      setDomains(data || []);
    }
  };

  const fetchFolderStats = async (linkIds: string[]) => {
    const { data, error } = await supabase.rpc("get_folder_stats", {
      link_ids: linkIds,
    });

    if (error) {
      console.error("Error fetching folder stats:", error);
    } else {
      setStats(data);
    }
  };

  useEffect(() => {
    fetchFolderData();
    fetchDomains();
  }, [folderId]);

  const handleLinkAdded = () => {
    fetchFolderData();
  };

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

  const prepareChartData = (data: Record<string, number>) => {
    return Object.entries(data || {}).map(([name, value]) => ({ name, value }));
  };

  const operatingSystems = prepareChartData(stats?.os_stats);
  const browsers = prepareChartData(stats?.browser_stats);
  const clicksOverTime = stats?.clicks_over_time || [];

  const topPerformingLink = folderData.shortened_links.reduce(
    (max: { clicks: number }, link: { clicks: number }) =>
      link.clicks > max.clicks ? link : max,
    folderData.shortened_links[0]
  );

  const SHORT_DOMAIN =
    process.env.NEXT_PUBLIC_SHORT_DOMAIN || "localhost:3000/s";

  return (
    <main className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{folderData.name}</h1>
        <Button asChild>
          <Link href={`/links/new`}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add New Link
          </Link>
        </Button>
      </div>
      <div className="space-y-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Links"
            value={folderData.shortened_links.length}
            icon={LinkIcon}
          />
          <StatCard
            title="Total Clicks"
            value={stats?.total_clicks || 0}
            icon={BarChart2}
          />
          <StatCard
            title="Created"
            value={new Date(folderData.created_at).toLocaleDateString()}
            icon={Calendar}
          />
          <StatCard
            title="Top Performing Link"
            value={`${topPerformingLink.clicks} clicks`}
            description={`${
              topPerformingLink.domains?.domain || SHORT_DOMAIN
            }/${topPerformingLink.short_code}`}
            icon={ArrowUpRight}
          />
        </div>

        {clicksOverTime.length > 0 ? (
          <FolderClicksOverTimeChart data={clicksOverTime} />
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
            <CardTitle>Links in this folder</CardTitle>
          </CardHeader>
          <CardContent>
            <LinkTable links={folderData.shortened_links} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
