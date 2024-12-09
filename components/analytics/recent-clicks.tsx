"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { RecentClick } from "@/types/analytics";
import { createClient } from "@/libs/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import * as flags from "country-flag-icons/react/3x2";
import {
  Globe,
  MousePointer,
  QrCode,
  Chrome,
  AppleIcon as Safari,
  ChromeIcon as Firefox,
} from "lucide-react";
import { getCountryCode } from "@/app/utils/country-codes";
import { Badge } from "@/components/ui/badge";

interface RecentClicksProps {
  initialClicks: RecentClick[];
  linkId: string | string[];
}

export function RecentClicks({ initialClicks, linkId }: RecentClicksProps) {
  const [clicks, setClicks] = useState<RecentClick[]>(initialClicks);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialClicks.length === 5);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);

  const loadMore = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const actualLinkId = Array.isArray(linkId) ? linkId[0] : linkId;

    const { data, error } = await supabase
      .from("link_clicks")
      .select(
        "id, created_at, browser, operating_system, city, country, is_qr_scan"
      )
      .eq("link_id", actualLinkId)
      .order("created_at", { ascending: false })
      .range(clicks.length, clicks.length + 9);

    setIsLoading(false);

    if (error) {
      console.error("Error fetching more clicks:", error);
      return;
    }

    if (data) {
      setClicks([...clicks, ...data]);
      setHasMore(data.length === 10);
      setHasLoadedMore(true);
    }
  };

  const showLess = () => {
    setClicks(initialClicks);
    setHasMore(true);
    setHasLoadedMore(false);
  };

  const getFlagComponent = (countryName: string) => {
    const countryCode = getCountryCode(countryName);
    const FlagComponent = flags[countryCode as keyof typeof flags];

    if (FlagComponent) {
      return <FlagComponent title={countryName} />;
    }

    return <Globe className="h-6 w-6" />;
  };

  const getBrowserIcon = (browserName: string) => {
    const name = browserName.toLowerCase();
    if (name.includes("chrome")) return <Chrome className="h-4 w-4" />;
    if (name.includes("safari")) return <Safari className="h-4 w-4" />;
    if (name.includes("firefox")) return <Firefox className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Location</TableCell>
              <TableCell>Browser & OS</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell className="text-right">Time</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clicks.map((click) => (
              <TableRow
                key={click.id}
                className="group hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {getFlagComponent(click.country)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {click.city}, {click.country}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getBrowserIcon(click.browser)}
                    <span className="text-sm">
                      {click.browser} on {click.operating_system}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {click.is_qr_scan ? (
                    <Badge variant="secondary" className="gap-1">
                      <QrCode className="h-3 w-3" />
                      QR Scan
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <MousePointer className="h-3 w-3" />
                      Click
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(click.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 space-x-2 flex justify-center">
          {hasMore && !hasLoadedMore && (
            <Button
              onClick={loadMore}
              disabled={isLoading}
              className="text-sm h-8"
              variant="outline"
              size="sm"
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          )}
          {hasLoadedMore && (
            <Button
              onClick={showLess}
              className="text-sm h-8"
              variant="outline"
              size="sm"
            >
              Show Less
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
