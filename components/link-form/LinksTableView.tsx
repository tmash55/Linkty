import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronUp,
  ChevronDown,
  Edit,
  BarChart2,
  Copy,
  Check,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShortenedLink, SortField } from "@/types/links";

interface LinksTableViewProps {
  links: ShortenedLink[];
  isLoading: boolean;
  sortField: SortField;
  sortDirection: "asc" | "desc";
  handleSort: (field: SortField) => void;
  handleCopyLink: (shortUrl: string, linkId: string) => void;
  copiedLinkId: string | null;
  setOpenDialogId: (id: string | null) => void;
  SHORT_DOMAIN: string;
}

export function LinksTableView({
  links,
  isLoading,
  sortField,
  sortDirection,
  handleSort,
  handleCopyLink,
  copiedLinkId,
  setOpenDialogId,
  SHORT_DOMAIN,
}: LinksTableViewProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Short URL</TableHead>
            <TableHead className="w-[30%]">Original URL</TableHead>
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
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-[180px]" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[250px]" />
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
          ) : links.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No links found
              </TableCell>
            </TableRow>
          ) : (
            links.map((link) => (
              <TableRow key={link.id}>
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
  );
}
