"use client";

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

const ITEMS_TO_SHOW = 5;

interface ChartData {
  name: string;
  value: number;
}

interface ListItemProps {
  name: string;
  value: number;
  icon: React.ReactNode;
  percentage: number;
}

function ListItem({ name, value, icon, percentage }: ListItemProps) {
  return (
    <div className="relative">
      {/* Background bar showing the percentage */}
      <div
        className="absolute inset-0 bg-secondary/20 rounded-lg transition-all duration-500 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
      {/* Content */}
      <div className="relative flex items-center p-2 rounded-lg">
        <div className="mr-2">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
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
}

export function AnalyticsList({ title, items, getIcon }: AnalyticsListProps) {
  const hasMore = items.length > ITEMS_TO_SHOW;
  const displayItems = hasMore ? items.slice(0, ITEMS_TO_SHOW) : items;

  // Calculate percentages based on the highest value
  const maxValue = useMemo(() => {
    return Math.max(...items.map((item) => item.value));
  }, [items]);

  const getPercentage = (value: number) => {
    return (value / maxValue) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayItems.map((item) => (
            <ListItem
              key={item.name}
              name={item.name}
              value={item.value}
              icon={getIcon(item.name)}
              percentage={getPercentage(item.value)}
            />
          ))}

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
                  {items.map((item) => (
                    <ListItem
                      key={item.name}
                      name={item.name}
                      value={item.value}
                      icon={getIcon(item.name)}
                      percentage={getPercentage(item.value)}
                    />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
