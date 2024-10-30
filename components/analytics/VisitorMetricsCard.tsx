import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VisitorMetrics {
  total_clicks: number;
  unique_visitors: number;
}

interface VisitorMetricsCardProps {
  metrics: {
    "24h": VisitorMetrics;
    "7d": VisitorMetrics;
    "30d": VisitorMetrics;
  };
}

export function VisitorMetricsCard({ metrics }: VisitorMetricsCardProps) {
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

          {Object.entries(metrics).map(([timeFrame, data]) => (
            <TabsContent key={timeFrame} value={timeFrame}>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {data.unique_visitors.toLocaleString()}
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
