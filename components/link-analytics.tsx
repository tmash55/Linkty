"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/libs/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, PieChart, DonutChart } from "@/components/ui/chart"
import { Monitor, Smartphone, Tablet } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LinkData {
  id: string
  short_code: string
  original_url: string
}

interface ClickData {
  date: string
  clicks: number
}

interface PieChartData {
  name: string
  value: number
}

export function LinkAnalytics() {
  const { id } = useParams()
  const [link, setLink] = useState<LinkData | null>(null)
  const [clicksOverTime, setClicksOverTime] = useState<ClickData[]>([])
  const [referrers, setReferrers] = useState<PieChartData[]>([])
  const [devices, setDevices] = useState<PieChartData[]>([])
  const [browsers, setBrowsers] = useState<PieChartData[]>([])
  const [operatingSystems, setOperatingSystems] = useState<PieChartData[]>([])
  const [timeFilter, setTimeFilter] = useState("7")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchLinkData()
    fetchAnalytics()
  }, [id, timeFilter])

  async function fetchLinkData() {
    setIsLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from("shortened_links")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching link:", error)
      setError("Failed to fetch link data")
    } else {
      setLink(data)
    }
    setIsLoading(false)
  }

  async function fetchAnalytics() {
    setIsLoading(true)
    setError(null)
    const timeAgo = new Date()
    timeAgo.setDate(timeAgo.getDate() - parseInt(timeFilter))

    try {
      // Fetch clicks over time
      const { data: clicksData, error: clicksError } = await supabase
        .from("link_clicks")
        .select("created_at")
        .eq("link_id", id)
        .gte("created_at", timeAgo.toISOString())
        .order("created_at", { ascending: true })

      if (clicksData && !clicksError) {
        const clicksByDay = clicksData.reduce((acc, click) => {
          const date = new Date(click.created_at).toLocaleDateString()
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        setClicksOverTime(
          Object.entries(clicksByDay).map(([date, clicks]) => ({ date, clicks }))
        )
      }

      // Fetch referrers
      const { data: referrerData, error: referrerError } = await supabase
        .from("link_clicks")
        .select("referrer")
        .eq("link_id", id)
        .gte("created_at", timeAgo.toISOString())

      if (referrerData && !referrerError) {
        const referrerCounts = referrerData.reduce((acc, click) => {
          const referrer = click.referrer || "Direct"
          acc[referrer] = (acc[referrer] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        setReferrers(
          Object.entries(referrerCounts).map(([name, value]) => ({ name, value }))
        )
      }

      // Fetch devices
      const { data: deviceData, error: deviceError } = await supabase
        .from("link_clicks")
        .select("device_type")
        .eq("link_id", id)
        .gte("created_at", timeAgo.toISOString())

      if (deviceData && !deviceError) {
        const deviceCounts = deviceData.reduce((acc, click) => {
          acc[click.device_type] = (acc[click.device_type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        setDevices(
          Object.entries(deviceCounts).map(([name, value]) => ({ name, value }))
        )
      }

      // Fetch browsers
      const { data: browserData, error: browserError } = await supabase
        .from("link_clicks")
        .select("browser")
        .eq("link_id", id)
        .gte("created_at", timeAgo.toISOString())

      if (browserData && !browserError) {
        const browserCounts = browserData.reduce((acc, click) => {
          acc[click.browser] = (acc[click.browser] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        setBrowsers(
          Object.entries(browserCounts).map(([name, value]) => ({ name, value }))
        )
      }

      // Fetch operating systems
      const { data: osData, error: osError } = await supabase
        .from("link_clicks")
        .select("operating_system")
        .eq("link_id", id)
        .gte("created_at", timeAgo.toISOString())

      if (osData && !osError) {
        const osCounts = osData.reduce((acc, click) => {
          acc[click.operating_system] = (acc[click.operating_system] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        setOperatingSystems(
          Object.entries(osCounts).map(([name, value]) => ({ name, value }))
        )
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError("Failed to fetch analytics data")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto py-10">Loading...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!link) {
    return <div className="container mx-auto py-10">Link not found</div>
  }

  const totalClicks = clicksOverTime.reduce((sum, day) => sum + day.clicks, 0)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Link Analytics</h1>
      
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{link.short_code}</h2>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalClicks}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Clicks Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={clicksOverTime}
            index="date"
            categories={["clicks"]}
            colors={["blue"]}
            yAxisWidth={40}
            height={300}
          />
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Operating Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={operatingSystems}
              index="name"
              category="value"
              colors={["sky", "blue", "indigo", "violet", "purple"]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[300px]">
            <div className="flex gap-8">
              {devices.map((device) => (
                <div key={device.name} className="text-center">
                  {device.name === "Desktop" && <Monitor size={48} className="mx-auto mb-2" />}
                  {device.name === "Mobile" && <Smartphone size={48} className="mx-auto mb-2" />}
                  {device.name === "Tablet" && <Tablet size={48} className="mx-auto mb-2" />}
                  <p className="text-lg font-semibold">{device.value}</p>
                  <p className="text-sm text-gray-500">{device.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={referrers}
              index="name"
              category="value"
              colors={["red", "orange", "yellow", "green", "blue"]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={browsers}
              index="name"
              category="value"
              colors={["pink", "rose", "fuchsia", "purple", "violet"]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}