"use client"

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, LineChart } from '@/components/ui/chart';

export function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [dataType, setDataType] = useState('clicks');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  async function fetchAnalyticsData() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const { data, error } = await supabase.rpc('get_analytics_data', {
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString()
    });

    if (error) {
      console.error('Error fetching analytics data:', error);
    } else {
      setAnalyticsData(data);
    }
  }

  if (!analyticsData) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <Tabs value={dataType} onValueChange={setDataType}>
          <TabsList>
            <TabsTrigger value="clicks">Clicks</TabsTrigger>
            <TabsTrigger value="visitors">Visitors</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{dataType === 'clicks' ? 'Clicks' : 'Visitors'} Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={analyticsData.click_data.map(d => ({
                date: d.date,
                value: dataType === 'clicks' ? d.clicks : d.visitors
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Links</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={analyticsData.top_links.map(d => ({
                name: d.short_code,
                value: dataType === 'clicks' ? d.clicks : d.visitors
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={analyticsData.geo_data.map(d => ({
                name: d.country,
                value: dataType === 'clicks' ? d.clicks : d.visitors
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={analyticsData.device_data.map(d => ({
                name: d.device_type,
                value: dataType === 'clicks' ? d.clicks : d.visitors
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}