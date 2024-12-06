import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit,
  BarChart2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShortenedLink } from "@/types/links";

interface LinksCardViewProps {
  links: ShortenedLink[];
  isLoading: boolean;
  handleCopyLink: (shortUrl: string, linkId: string) => void;
  copiedLinkId: string | null;
  setOpenDialogId: (id: string | null) => void;
  SHORT_DOMAIN: string;
}

export function LinksCardView({
  links,
  isLoading,
  handleCopyLink,
  copiedLinkId,
  setOpenDialogId,
  SHORT_DOMAIN,
}: LinksCardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading
        ? Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="bg-card">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-[250px] mb-4" />
                <Skeleton className="h-4 w-[180px] mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-6 pt-2">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </CardFooter>
            </Card>
          ))
        : links.map((link) => (
            <Card key={link.id} className="bg-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <a
                      href={`http://${SHORT_DOMAIN}/${link.short_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-semibold text-primary hover:underline"
                    >
                      {`${link.domain || SHORT_DOMAIN}/${link.short_code}`}
                    </a>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            handleCopyLink(
                              `${link.domain || SHORT_DOMAIN}/${
                                link.short_code
                              }`,
                              link.id
                            )
                          }
                          className="h-8 w-8"
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
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ArrowRight className="h-4 w-4 shrink-0" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="truncate cursor-help text-sm">
                          {link.original_url}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-sm">
                        <p className="break-all">{link.original_url}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(link.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Clicks: {link.total_clicks}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-6 pt-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-lg"
                      asChild
                    >
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
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-lg"
                      asChild
                    >
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
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-lg"
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 rounded-lg"
                      asChild
                    >
                      <a
                        href={`http://${SHORT_DOMAIN}/${link.short_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Visit link</span>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visit link</p>
                  </TooltipContent>
                </Tooltip>
              </CardFooter>
            </Card>
          ))}
    </div>
  );
}
