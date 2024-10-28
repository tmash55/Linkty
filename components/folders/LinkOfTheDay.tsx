import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Domain {
  id: string;
  domain: string;
}

interface Link {
  id: string;
  original_url: string;
  short_code: string;
  clicks: number;
  domains: Domain | null;
}

interface LinkOfTheDayProps {
  links: Link[];
  domains: Domain[];
}

export function LinkOfTheDay({ links, domains }: LinkOfTheDayProps) {
  const SHORT_DOMAIN = process.env.NEXT_PUBLIC_SHORT_DOMAIN || "short.test";

  // Use the current date as a seed for the random selection
  const today = new Date().toDateString();
  const randomIndex =
    links.length > 0
      ? Math.floor(
          parseInt(
            today
              .split("")
              .map((c) => c.charCodeAt(0))
              .join("")
          ) % links.length
        )
      : 0;

  const linkOfTheDay = links[randomIndex];

  if (!linkOfTheDay) return null;

  const domain = linkOfTheDay.domains
    ? linkOfTheDay.domains.domain
    : SHORT_DOMAIN;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-400" />
          <span>Link of the Day</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium">{linkOfTheDay.original_url}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {`${domain}/${linkOfTheDay.short_code}`}
        </p>
        <p className="text-sm mt-2">Clicks: {linkOfTheDay.clicks}</p>
      </CardContent>
    </Card>
  );
}
