"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/libs/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { nanoid } from "nanoid";

interface Folder {
  id: string;
  name: string;
}

interface Domain {
  id: string;
  domain: string;
}

const NO_FOLDER_VALUE = "no_folder";
const DEFAULT_DOMAIN_VALUE = "default_domain";

export function LinkForm() {
  const [url, setUrl] = useState("");
  const [folderId, setFolderId] = useState<string>(NO_FOLDER_VALUE);
  const [domainId, setDomainId] = useState<string>(DEFAULT_DOMAIN_VALUE);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const supabase = createClient();
  const SHORT_DOMAIN = process.env.NEXT_PUBLIC_SHORT_DOMAIN || "short.test";

  useEffect(() => {
    fetchFolders();
    fetchDomains();
  }, []);

  const fetchFolders = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("id, name")
      .order("name");
    if (data) setFolders(data);
    if (error) console.error("Error fetching folders:", error);
  };

  const fetchDomains = async () => {
    const { data, error } = await supabase
      .from("domains")
      .select("id, domain")
      .order("domain");
    if (data) setDomains(data);
    if (error) console.error("Error fetching domains:", error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setShortenedUrl(null);

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
        folder_id: folderId === NO_FOLDER_VALUE ? null : folderId,
        domain_id: domainId === DEFAULT_DOMAIN_VALUE ? null : domainId,
      });

      if (error) throw error;

      const selectedDomain =
        domainId === DEFAULT_DOMAIN_VALUE
          ? SHORT_DOMAIN
          : domains.find((d) => d.id === domainId)?.domain || SHORT_DOMAIN;

      setShortenedUrl(`http://${selectedDomain}/${shortCode}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Link</CardTitle>
        <CardDescription>
          Shorten your URL and track its performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL to shorten</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="folder">Folder (optional)</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_FOLDER_VALUE}>No folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Select value={domainId} onValueChange={setDomainId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT_DOMAIN_VALUE}>
                  {SHORT_DOMAIN}
                </SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    {domain.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Short Link"}
          </Button>
        </form>
      </CardContent>
      {shortenedUrl && (
        <CardFooter>
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-2">Your Shortened Link:</h2>
            <Alert>
              <AlertDescription>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {shortenedUrl}
                </a>
              </AlertDescription>
            </Alert>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
