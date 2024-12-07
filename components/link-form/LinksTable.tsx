"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/libs/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  RefreshCw,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { LinksTableView } from "./LinksTableView";
import { LinksCardView } from "./LinksCardView";
import { QRCodeSettings, ShortenedLink, SortField } from "@/types/links";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import QRCodeGenerator from "../QRCodes/QRCodeGenerator";

const SHORT_DOMAIN = process.env.NEXT_PUBLIC_SHORT_DOMAIN || "localhost:3000/s";

export default function LinksTable() {
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const supabase = createClient();

  const fetchLinks = useCallback(async () => {
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
  }, [sortField, sortDirection, supabase]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleSort = useCallback((field: SortField) => {
    setSortField((prevField) => {
      if (field === prevField) {
        setSortDirection((prevDirection) =>
          prevDirection === "asc" ? "desc" : "asc"
        );
      } else {
        setSortDirection("desc");
      }
      return field;
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchLinks();
  }, [fetchLinks]);

  const handleCopyLink = useCallback(
    async (shortUrl: string, linkId: string) => {
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
    },
    []
  );

  const saveQRSettings = useCallback(
    async (linkId: string, settings: QRCodeSettings) => {
      const { data, error } = await supabase
        .from("shortened_links")
        .update({
          qr_settings: settings,
        })
        .eq("id", linkId);

      if (error) {
        console.error("Error saving QR code settings:", error);
        toast({
          title: "Error",
          description: "Failed to save QR code settings. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "QR code settings saved successfully.",
        });
        setLinks((prevLinks) =>
          prevLinks.map((link) =>
            link.id === linkId ? { ...link, qr_settings: settings } : link
          )
        );
      }
    },
    [supabase]
  );

  const filteredLinks = useMemo(() => {
    return links.filter(
      (link) =>
        link.original_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.short_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [links, searchTerm]);

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
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setViewMode("table")}
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="icon"
                >
                  <LayoutList className="h-4 w-4" />
                  <span className="sr-only">Table View</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Table View</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setViewMode("card")}
                  variant={viewMode === "card" ? "default" : "outline"}
                  size="icon"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="sr-only">Card View</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Card View</p>
              </TooltipContent>
            </Tooltip>
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
        </div>
        {viewMode === "table" ? (
          <LinksTableView
            links={filteredLinks}
            isLoading={isLoading}
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
            handleCopyLink={handleCopyLink}
            copiedLinkId={copiedLinkId}
            setOpenDialogId={setOpenDialogId}
            SHORT_DOMAIN={SHORT_DOMAIN}
          />
        ) : (
          <LinksCardView
            links={filteredLinks}
            isLoading={isLoading}
            handleCopyLink={handleCopyLink}
            copiedLinkId={copiedLinkId}
            setOpenDialogId={setOpenDialogId}
            SHORT_DOMAIN={SHORT_DOMAIN}
          />
        )}
      </div>
      {filteredLinks.map((link) => (
        <Dialog
          key={link.id}
          open={openDialogId === link.id}
          onOpenChange={(open) => setOpenDialogId(open ? link.id : null)}
        >
          <DialogContent className="max-w-3xl w-full">
            <QRCodeGenerator
              shortUrl={`${link.domain || SHORT_DOMAIN}/${link.short_code}`}
              originalUrl={link.original_url}
              initialSettings={link.qr_settings}
              onSave={(settings) => saveQRSettings(link.id, settings)}
            />
          </DialogContent>
        </Dialog>
      ))}
    </TooltipProvider>
  );
}
