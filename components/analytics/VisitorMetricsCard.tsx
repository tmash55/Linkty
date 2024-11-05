import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VisitorMetrics {
  total_clicks: number;
  unique_visitors: number;
  top_referrers: Record<string, number>;
  top_browsers: Record<string, number>;
  top_devices: Record<string, number>;
}

interface VisitorMetricsCardProps {
  metrics: Record<string, VisitorMetrics>;
}

export function VisitorMetricsCard({ metrics }: VisitorMetricsCardProps) {
  // Ensure we have valid metrics data
  if (!metrics) return null;

  // Filter to only show the time frames we want
  const timeFrames = ["24h", "7d", "30d"];
  const filteredMetrics = Object.entries(metrics)
    .filter(([key]) => timeFrames.includes(key))
    .reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          total_clicks: value.total_clicks || 0,
          unique_visitors: value.unique_visitors || 0,
        },
      }),
      {} as Record<string, { total_clicks: number; unique_visitors: number }>
    );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Visitor Analytics</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="24h" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="24h" className="text-xs">
              24h
            </TabsTrigger>
            <TabsTrigger value="7d" className="text-xs">
              7d
            </TabsTrigger>
            <TabsTrigger value="30d" className="text-xs">
              30d
            </TabsTrigger>
          </TabsList>

          {Object.entries(filteredMetrics).map(([timeFrame, data]) => (
            <TabsContent key={timeFrame} value={timeFrame}>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {(data.unique_visitors || 0).toLocaleString()}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Unique visitors
                  </p>
                  <p className="text-xs font-medium">
                    {data.unique_visitors > 0
                      ? `${(
                          (data.total_clicks / data.unique_visitors) *
                          100
                        ).toFixed(1)}% CR`
                      : "0% CR"}
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
