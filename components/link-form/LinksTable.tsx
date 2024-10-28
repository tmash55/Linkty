"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/libs/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronUp,
  ChevronDown,
  Edit,
  BarChart2,
  RefreshCw,
  Copy,
  Check,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import QRCodeGenerator from "../QRCodes/QRCodeGenerator";

const SHORT_DOMAIN = process.env.NEXT_PUBLIC_SHORT_DOMAIN || "localhost:3000/s";

type ShortenedLink = {
  id: string;
  original_url: string;
  short_code: string;
  created_at: string;
  clicks: number;
  domain: string | null;
};

type SortField = "created_at" | "clicks";

export default function LinksTable() {
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchLinks();
  }, [sortField, sortDirection]);

  async function fetchLinks() {
    setIsLoading(true);
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      let query = supabase
        .from("shortened_links")
        .select("*, domains(domain)")
        .eq("user_id", user.user.id);

      if (sortField) {
        query = query.order(sortField, { ascending: sortDirection === "asc" });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching links:", error);
      } else {
        setLinks(
          data.map((link) => ({
            ...link,
            domain: link.domains?.domain || null,
          })) || []
        );
      }
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLinks();
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

  const filteredLinks = links.filter(
    (link) =>
      link.original_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.short_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Input
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="icon"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="sr-only">Refresh</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="rounded-md border">
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
                  onClick={() => handleSort("clicks")}
                >
                  Clicks{" "}
                  {sortField === "clicks" &&
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[250px]" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-[180px]" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[50px]" />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLinks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No links found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLinks.map((link) => (
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
                          {`${link.domain || SHORT_DOMAIN}/${link.short_code}`}
                        </a>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopyLink(
                                  `${link.domain || SHORT_DOMAIN}/${
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
                    <TableCell>{link.clicks}</TableCell>
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setOpenDialogId(link.id)}
                            >
                              <QrCode className="h-4 w-4" />
                              <span className="sr-only">Generate QR Code</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Generate QR Code</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {filteredLinks.map((link) => (
        <Dialog
          key={link.id}
          open={openDialogId === link.id}
          onOpenChange={() => setOpenDialogId(null)}
        >
          <DialogContent className="max-w-3xl w-full">
            <QRCodeGenerator
              initialUrl={`${link.domain || SHORT_DOMAIN}/${link.short_code}`}
            />
          </DialogContent>
        </Dialog>
      ))}
    </TooltipProvider>
  );
}
