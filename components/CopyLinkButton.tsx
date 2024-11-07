"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CopyLinkButtonProps {
  shortCode: string;
}

export default function CopyLinkButton({ shortCode }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 font-mono"
            onClick={handleCopy}
          >
            {shortCode}
            {copied ? (
              <Check className="ml-1 h-3 w-3 text-green-500" />
            ) : (
              <Copy className="ml-1 h-3 w-3" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy Link ID"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
