"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Globe,
  Loader,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart } from "@/components/ui/chart2";
import { AnalyticsList } from "@/components/analytics/analytics-list";
import { LinkClicksChart } from "@/components/analytics/LinkClicksChart";

interface LinkData {
  id: string;
  short_code: string;
  original_url: string;
}

interface ClickData {
  date: string;
  clicks: number;
}

interface ChartData {
  name: string;
  value: number;
}

const SafariIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8 16l2 -6l6 -2l-2 6l-6 2" />
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
  </svg>
);

const FirefoxIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4.028 7.82a9 9 0 1 0 12.823 -3.4c-1.636 -1.02 -3.064 -1.02 -4.851 -1.02h-1.647" />
    <path d="M4.914 9.485c-1.756 -1.569 -.805 -5.38 .109 -6.17c.086 .896 .585 1.208 1.111 1.685c.88 -.275 1.313 -.282 1.867 0c.82 -.91 1.694 -2.354 2.628 -2.093c-1.082 1.741 -.07 3.733 1.371 4.173c-.17 .975 -1.484 1.913 -2.76 2.686c-1.296 .938 -.722 1.85 0 2.234c.949 .506 3.611 -1 4.545 .354c-1.698 .102 -1.536 3.107 -3.983 2.727c2.523 .957 4.345 .462 5.458 -.34c1.965 -1.52 2.879 -3.542 2.879 -5.557c-.014 -1.398 .194 -2.695 -1.26 -4.75" />
  </svg>
);

const EdgeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M20.978 11.372a9 9 0 1 0 -1.593 5.773" />
    <path d="M20.978 11.372c.21 2.993 -5.034 2.413 -6.913 1.486c1.392 -1.6 .402 -4.038 -2.274 -3.851c-1.745 .122 -2.927 1.157 -2.784 3.202c.28 3.99 4.444 6.205 10.36 4.79" />
    <path d="M3.022 12.628c-.283 -4.043 8.717 -7.228 11.248 -2.688" />
    <path d="M12.628 20.978c-2.993 .21 -5.162 -4.725 -3.567 -9.748" />
  </svg>
);

const ChromeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    <path d="M12 9h8.4" />
    <path d="M14.598 13.5l-4.2 7.275" />
    <path d="M9.402 13.5l-4.2 -7.275" />
  </svg>
);

export default function LinkAnalyticsPage() {
  const { id } = useParams();
  const [link, setLink] = useState<LinkData | null>(null);
  const [clicksOverTime, setClicksOverTime] = useState<ClickData[]>([]);
  const [referrers, setReferrers] = useState<ChartData[]>([]);
  const [devices, setDevices] = useState<ChartData[]>([]);
  const [browsers, setBrowsers] = useState<ChartData[]>([]);
  const [operatingSystems, setOperatingSystems] = useState<ChartData[]>([]);
  const [locations, setLocations] = useState<ChartData[]>([]);
  const [timeFilter, setTimeFilter] = useState("7");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchLinkData();
    fetchAnalytics();
  }, [id, timeFilter]);

  async function fetchLinkData() {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("shortened_links")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching link:", error);
      setError("Failed to fetch link data");
    } else {
      setLink(data);
    }
  }

  async function fetchAnalytics() {
    setError(null);
    const timeAgo = new Date();
    timeAgo.setDate(timeAgo.getDate() - parseInt(timeFilter));

    try {
      // Fetch clicks over time
      const { data: clicksData, error: clicksError } = await supabase
        .from("link_clicks")
        .select("created_at")
        .eq("link_id", id)
        .gte("created_at", timeAgo.toISOString())
        .order("created_at", { ascending: true });

      if (clicksData && !clicksError) {
        const clicksByDay: { [key: string]: number } = {};
        const startDate = new Date(timeAgo);
        const endDate = new Date();

        // Initialize all days with 0 clicks
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          clicksByDay[d.toISOString().split("T")[0]] = 0;
        }

        // Aggregate clicks by day
        clicksData.forEach((click) => {
          const date = new Date(click.created_at).toISOString().split("T")[0];
          clicksByDay[date] = (clicksByDay[date] || 0) + 1;
        });

        // Convert to array and sort by date
        setClicksOverTime(
          Object.entries(clicksByDay)
            .map(([date, clicks]) => ({ date, clicks }))
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
        );
      }

      // Fetch referrers
      const { data: referrerData, error: referrerError } = await supabase
        .from("link_clicks")
        .select("referrer")
        .eq("link_id", id)
        .gte("created_at", timeAgo.toISOString());

      if (referrerData && !referrerError) {
        const referrerCounts = referrerData.reduce((acc, click) => {
          const referrer = click.referrer || "Direct";
          acc[referrer] = (acc[referrer] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setReferrers(
          Object.entries(referrerCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
        );
      }

      // Fetch devices
      const { data: deviceData, error: deviceError } = await supabase
        .from("link_clicks")
        .select("device_type")
        .eq("link_id", id)
        .gte("created_at", timeAgo.toISOString());

      if (deviceData && !deviceError) {
        const deviceCounts = deviceData.reduce((acc, click) => {
          acc[click.device_type] = (acc[click.device_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setDevices(
          Object.entries(deviceCounts).map(([name, value]) => ({ name, value }))
        );
      }

      // Fetch browsers
      const { data: browserData, error: browserError } = await supabase
        .from("link_clicks")
        .select("browser")
        .eq("link_id", id)
        .gte("created_at", timeAgo.toISOString());

      if (browserData && !browserError) {
        const browserCounts = browserData.reduce((acc, click) => {
          acc[click.browser] = (acc[click.browser] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setBrowsers(
          Object.entries(browserCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
        );
      }

      // Fetch operating systems
      const { data: osData, error: osError } = await supabase
        .from("link_clicks")
        .select("operating_system")
        .eq("link_id", id)
        .gte("created_at", timeAgo.toISOString());

      if (osData && !osError) {
        const osCounts = osData.reduce((acc, click) => {
          acc[click.operating_system] = (acc[click.operating_system] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setOperatingSystems(
          Object.entries(osCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
        );
      }

      // Fetch locations
      const { data: locationData, error: locationError } = await supabase
        .from("link_clicks")
        .select("country")
        .eq("link_id", id)
        .gte("created_at", timeAgo.toISOString());

      if (osData && !osError) {
        const osCounts = osData.reduce((acc, click) => {
          let os = click.operating_system.toLowerCase();

          if (os.includes("android")) {
            os = "Android";
          } else if (os.includes("windows")) {
            os = "Windows";
          } else if (os.includes("mac") && !os.includes("ios")) {
            os = "Mac OS";
          } else if (
            os.includes("ios") ||
            os.includes("iphone") ||
            os.includes("ipad")
          ) {
            os = "iOS";
          } else if (
            os.includes("linux") &&
            !os.includes("ubuntu") &&
            !os.includes("chromium")
          ) {
            os = "Linux";
          } else if (os.includes("chromium")) {
            os = "Chromium OS";
          } else if (os.includes("ubuntu")) {
            os = "Ubuntu";
          } else {
            os = "Other";
          }

          acc[os] = (acc[os] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setOperatingSystems(
          Object.entries(osCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
        );
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to fetch analytics data");
    } finally {
      setIsLoading(false);
    }
  }
  const getOsIcon = (osName: string) => {
    const lowerName = osName.toLowerCase();
    switch (lowerName) {
      case "android":
        return (
          <svg
            className="w-4 h-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4049 13.8533 7.9091 12 7.9091c-1.8533 0-3.5902.4958-5.1367 1.0397l-2.0223-3.503a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
          </svg>
        );
      case "windows":
        return (
          <svg
            className="w-4 h-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
          </svg>
        );
      case "mac os":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 4m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z" />
            <path d="M7 8v1" />
            <path d="M17 8v1" />
            <path d="M12.5 4c-.654 1.486 -1.26 3.443 -1.5 9h2.5c-.19 2.867 .094 5.024 .5 7" />
            <path d="M7 15.5c3.667 2 6.333 2 10 0" />
          </svg>
        );
      case "ios":
        return (
          <svg
            className="w-4 h-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        );
      case "linux":
        return (
          <svg
            className="w-4 h-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 00-.402-.533 1.45 1.45 0 00-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 00.314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 01.647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01c.053 0 .105.005.157.014.376.055.706.333 1.023.752l.91 1.664.003.003c.243.533.754 1.064 1.189 1.637.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294-.645.135-1.52.002-2.395-.464-.968-.536-2.118-.469-2.857-.602-.369-.066-.61-.2-.723-.4-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118-.055-.401-.083-.71.043-.94.16-.334.396-.4.69-.533.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838.19-.201.38-.336.663-.336zm7.159-9.074c-.435.201-.945.535-1.488.535-.542 0-.97-.267-1.28-.466-.154-.134-.28-.268-.373-.335-.164-.134-.144-.333-.074-.333.109.016.129.134.199.2.096.066.215.2.36.333.292.2.68.467 1.167.467.485 0 1.053-.267 1.398-.466.195-.135.445-.334.648-.467.156-.136.149-.267.279-.267.128.016.034.134-.147.332a8.097 8.097 0 01-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05.074-.043.18-.027.26.004.063 0 .16.067.15.135-.006.049-.085.066-.135.066-.055 0-.092-.043-.141-.068-.052-.018-.146-.008-.163-.065zm-.551 0c-.02.058-.113.049-.166.066-.047.025-.086.068-.14.068-.05 0-.13-.02-.136-.068-.01-.066.088-.133.15-.133.08-.031.184-.047.259-.005.019.009.036.03.03.05v.02h.003z" />
          </svg>
        );
      case "chromium os":
        return (
          <svg
            className="w-4 h-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
          </svg>
        );
      case "ubuntu":
        return (
          <svg
            className="w-4 h-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22 12c0 5.514-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2s10 4.486 10 10zM12 3c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8z M12 8c-2.205 0-4 1.795-4 4s1.795 4 4 4 4-1.795 4-4-1.795-4-4-4z" />
          </svg>
        );
      default:
        return <Globe className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getBrowserIcon = (browserName: string) => {
    const lowerCaseName = browserName.toLowerCase();
    if (lowerCaseName.includes("chrome")) return <ChromeIcon />;
    if (lowerCaseName.includes("firefox")) return <FirefoxIcon />;
    if (lowerCaseName.includes("safari")) return <SafariIcon />;
    if (lowerCaseName.includes("edge")) return <EdgeIcon />;
    return <Globe className="h-4 w-4 text-muted-foreground" />;
  };

  const getDeviceIcon = (deviceName: string) => {
    const lowerCaseName = deviceName.toLowerCase();
    if (lowerCaseName.includes("desktop"))
      return <Monitor className="h-8 w-8 mb-2" />;
    if (lowerCaseName.includes("mobile"))
      return <Smartphone className="h-8 w-8 mb-2" />;
    if (lowerCaseName.includes("tablet"))
      return <Tablet className="h-8 w-8 mb-2" />;
    return <Globe className="h-8 w-8 mb-2" />;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!link) {
    return <div className="container mx-auto py-10">Link not found</div>;
  }

  const totalClicks = clicksOverTime.reduce((sum, day) => sum + day.clicks, 0);

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

      <div className="mb-8">
        <LinkClicksChart data={clicksOverTime} timeFilter={timeFilter} />
      </div>

      <div className="grid gap-8 md:grid-cols-2 mb-8">
        <AnalyticsList
          title="Operating Systems"
          items={operatingSystems}
          getIcon={getOsIcon}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center gap-16 py-8">
              {devices.map((device) => (
                <div key={device.name} className="text-center">
                  <Monitor
                    className={`h-12 w-12 mx-auto mb-4  ${
                      device.name.toLowerCase() === "mobile"
                        ? "hidden"
                        : device.name.toLowerCase() === "tablet"
                        ? "hidden"
                        : ""
                    }`}
                  />
                  <Smartphone
                    className={`h-12 w-12 mx-auto mb-4  ${
                      device.name.toLowerCase() !== "mobile" && "hidden"
                    }`}
                  />
                  <Tablet
                    className={`h-12 w-12 mx-auto mb-4  ${
                      device.name.toLowerCase() !== "tablet" && "hidden"
                    }`}
                  />
                  <p className="text-4xl font-medium mb-2">{device.value}</p>
                  <p className="text-base text-muted-foreground">
                    {device.name.toLowerCase()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <AnalyticsList
          title="Referrers"
          items={referrers}
          getIcon={getBrowserIcon}
        />

        <AnalyticsList
          title="Browsers"
          items={browsers}
          getIcon={getBrowserIcon}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Top Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locations.map((location) => (
              <div key={location.name} className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {location.name}
                  </p>
                </div>
                <div className="ml-2">
                  <p className="text-sm text-muted-foreground">
                    {location.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
