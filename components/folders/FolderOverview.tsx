import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, Link, Calendar } from "lucide-react";

interface FolderOverviewProps {
  folder: {
    name: string;
    created_at: string;
    shortened_links: any[];
  };
}

export function FolderOverview({ folder }: FolderOverviewProps) {
  const totalLinks = folder.shortened_links.length;
  const totalClicks = folder.shortened_links.reduce(
    (sum, link) => sum + link.clicks,
    0
  );
  const createdAt = new Date(folder.created_at).toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{folder.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Link className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Links:</span>
            <span className="font-semibold">{totalLinks}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Folder className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Clicks:</span>
            <span className="font-semibold">{totalClicks}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Created:</span>
            <span className="font-semibold">{createdAt}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
