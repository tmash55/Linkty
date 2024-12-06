import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import * as flags from "country-flag-icons/react/3x2";
import { Globe } from "lucide-react";
import { getCountryCode } from "@/app/utils/country-codes";

interface ChartData {
  name: string;
  value: number;
}

interface ListItemProps {
  name: string;
  value: number;
  icon: React.ReactNode;
  percentage: number;
  subtext?: string;
}

function ListItem({ name, value, icon, percentage, subtext }: ListItemProps) {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 bg-secondary/20 rounded-lg transition-all duration-500 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
      <div className="relative flex items-center p-2 rounded-lg">
        <div className="mr-2">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
          {subtext && (
            <p className="text-xs text-muted-foreground truncate">{subtext}</p>
          )}
        </div>
        <div className="ml-2">
          <p className="text-sm text-muted-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface AnalyticsListProps {
  title: string;
  items: ChartData[];
  getIcon: (name: string) => React.ReactNode;
  isLocation?: boolean;
}

const ITEMS_TO_SHOW = 5;

export function AnalyticsList({
  title,
  items,
  getIcon,
  isLocation = false,
}: AnalyticsListProps) {
  const hasMore = items.length > ITEMS_TO_SHOW;
  const displayItems = hasMore ? items.slice(0, ITEMS_TO_SHOW) : items;

  const maxValue = useMemo(() => {
    return Math.max(...items.map((item) => item.value));
  }, [items]);

  const getPercentage = (value: number) => {
    return (value / maxValue) * 100;
  };

  const getFlagComponent = (countryName: string) => {
    const countryCode = getCountryCode(countryName);
    const FlagComponent = flags[countryCode as keyof typeof flags];

    if (FlagComponent) {
      return <FlagComponent title={countryName} className="h-4 w-4" />;
    }

    return <Globe className="h-4 w-4" />;
  };

  const renderListItem = (item: ChartData) => {
    const [city, country] = isLocation
      ? item.name.split(", ")
      : [item.name, ""];
    return (
      <ListItem
        key={item.name}
        name={city}
        value={item.value}
        icon={isLocation ? getFlagComponent(country) : getIcon(item.name)}
        percentage={getPercentage(item.value)}
        subtext={country}
      />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayItems.map(renderListItem)}

          {hasMore && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mt-4">
                  View All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-4">
                  {items.map(renderListItem)}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
