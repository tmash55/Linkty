import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { RecentClick } from "@/types/analytics";
import { createClient } from "@/libs/supabase/client";

import * as flags from "country-flag-icons/react/3x2";
import { Globe } from "lucide-react";
import { getCountryCode } from "@/app/utils/country-codes";

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
      .select("id, created_at, browser, operating_system, city, country")
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clicks.map((click) => (
            <div key={click.id} className="flex items-center">
              <Avatar className="h-7 w-7">
                <AvatarFallback>
                  {getFlagComponent(click.country)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 space-y-0.5 flex-1">
                <p className="text-sm font-medium leading-none">
                  {click.browser} on {click.operating_system}
                </p>
                <p className="text-xs text-muted-foreground">
                  {click.city}, {click.country}
                </p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(click.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
          ))}
        </div>
        {hasMore && !hasLoadedMore && (
          <Button
            onClick={loadMore}
            disabled={isLoading}
            className="w-full mt-4 text-sm h-8"
            variant="outline"
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        )}
        {hasLoadedMore && (
          <Button
            onClick={showLess}
            className="w-full mt-4 text-sm h-8"
            variant="outline"
          >
            Show Less
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
