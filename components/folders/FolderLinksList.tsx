import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, BarChart2, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Domain {
  id: string;
  domain: string;
}

interface LinkData {
  id: string;
  original_url: string;
  short_code: string;
  clicks: number;
  created_at: string;
  domains: Domain | null;
}

interface FolderLinksListProps {
  links: LinkData[];
  domains: Domain[];
}

export function FolderLinksList({ links, domains }: FolderLinksListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const SHORT_DOMAIN = process.env.NEXT_PUBLIC_SHORT_DOMAIN || "short.test";

  const filteredLinks = links.filter(
    (link) =>
      link.original_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.short_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Links in this folder</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Search links..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Short URL</TableHead>
              <TableHead>Original URL</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinks.map((link) => {
              const domain = link.domains ? link.domains.domain : SHORT_DOMAIN;
              const shortUrl = `${domain}/${link.short_code}`;
              return (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{shortUrl}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(shortUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    <a
                      href={link.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 hover:underline"
                    >
                      <span>{link.original_url}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TableCell>
                  <TableCell>{link.clicks}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/links/${link.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/links/${link.id}/analytics`}>
                          <BarChart2 className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
