"use client";

import React, { useState } from "react";
import { createClient } from "@/libs/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { nanoid } from "nanoid";

interface Domain {
  id: string;
  domain: string;
}

interface QuickAddLinkProps {
  folderId: string;
  onLinkAdded: () => void;
  domains?: Domain[];
}

const DEFAULT_DOMAIN = "default";

export function QuickAddLink({
  folderId,
  onLinkAdded,
  domains = [],
}: QuickAddLinkProps) {
  const [url, setUrl] = useState("");
  const [selectedDomain, setSelectedDomain] = useState(DEFAULT_DOMAIN);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        throw new Error("URL must start with http:// or https://");
      }

      const shortCode = nanoid(6);
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("shortened_links").insert({
        user_id: user.user.id,
        original_url: url,
        short_code: shortCode,
        clicks: 0,
        folder_id: folderId,
        domain_id: selectedDomain !== DEFAULT_DOMAIN ? selectedDomain : null,
      });

      if (error) throw error;

      setSuccess("Link added successfully!");
      setUrl("");
      setSelectedDomain(DEFAULT_DOMAIN);
      onLinkAdded();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PlusCircle className="h-5 w-5" />
          <span>Quick Add Link</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-grow"
            />
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT_DOMAIN}>Default</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    {domain.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Adding..." : "Add"}
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
