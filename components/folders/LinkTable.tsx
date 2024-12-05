"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronUp,
  ChevronDown,
  Edit,
  BarChart2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LinkData {
  id: string;
  original_url: string;
  short_code: string;
  total_clicks: number;
  created_at: string;
  domains: {
    domain: string;
  };
}

interface LinkTableProps {
  links: LinkData[];
}

const SHORT_DOMAIN = process.env.NEXT_PUBLIC_SHORT_DOMAIN || "localhost:3000/s";

export function LinkTable({ links }: LinkTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"created_at" | "total_clicks">(
    "created_at"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const handleSort = (field: "created_at" | "total_clicks") => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleCopyLink = async (shortUrl: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedLinkId(linkId);
      toast({
        title: "Copied!",
        description: "The short URL has been copied to your clipboard.",
      });
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Copy failed",
        description: "Unable to copy the URL. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredLinks = links
    .filter(
      (link) =>
        link.original_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.short_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "created_at") {
        return sortDirection === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return sortDirection === "asc"
          ? a.total_clicks - b.total_clicks
          : b.total_clicks - a.total_clicks;
      }
    });

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <Input
          placeholder="Search links..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Original URL</TableHead>
              <TableHead className="w-[30%]">Short URL</TableHead>
              <TableHead
                className="w-[15%] cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Created At{" "}
                {sortField === "created_at" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="inline" />
                  ) : (
                    <ChevronDown className="inline" />
                  ))}
              </TableHead>
              <TableHead
                className="w-[10%] cursor-pointer"
                onClick={() => handleSort("total_clicks")}
              >
                Clicks{" "}
                {sortField === "total_clicks" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="inline" />
                  ) : (
                    <ChevronDown className="inline" />
                  ))}
              </TableHead>
              <TableHead className="w-[15%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinks.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-medium">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate block cursor-help max-w-[300px]">
                        {link.original_url}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-sm">
                      <p className="break-all">{link.original_url}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`http://${SHORT_DOMAIN}/${link.short_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {`${link.domains?.domain || SHORT_DOMAIN}/${
                        link.short_code
                      }`}
                    </a>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleCopyLink(
                              `${link.domains?.domain || SHORT_DOMAIN}/${
                                link.short_code
                              }`,
                              link.id
                            )
                          }
                        >
                          {copiedLinkId === link.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="sr-only">Copy link</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy short URL</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(link.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{link.total_clicks}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/links/${link.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit link</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/links/${link.id}/analytics`}>
                            <BarChart2 className="h-4 w-4" />
                            <span className="sr-only">Analytics</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View analytics</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
