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
import { Loader2, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Folder {
  id: string;
  name: string;
}

interface Domain {
  id: string;
  domain: string;
}

interface EditLinkFormProps {
  linkId: string;
  onDelete?: () => void;
}

const NO_FOLDER_VALUE = "no_folder";
const DEFAULT_DOMAIN_VALUE = "default_domain";

export function EditLinkForm({ linkId, onDelete }: EditLinkFormProps) {
  const [url, setUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [folderId, setFolderId] = useState<string>(NO_FOLDER_VALUE);
  const [domainId, setDomainId] = useState<string>(DEFAULT_DOMAIN_VALUE);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const supabase = createClient();
  const SHORT_DOMAIN = process.env.NEXT_PUBLIC_SHORT_DOMAIN || "short.test";

  useEffect(() => {
    fetchLinkDetails();
    fetchFolders();
    fetchDomains();
  }, [linkId]);

  const fetchLinkDetails = async () => {
    const { data, error } = await supabase
      .from("shortened_links")
      .select("*")
      .eq("id", linkId)
      .single();

    if (error) {
      console.error("Error fetching link details:", error);
      toast({
        title: "Error",
        description: "Failed to load link details",
        variant: "destructive",
      });
    } else if (data) {
      setUrl(data.original_url);
      setShortCode(data.short_code);
      setFolderId(data.folder_id || NO_FOLDER_VALUE);
      setDomainId(data.domain_id || DEFAULT_DOMAIN_VALUE);
    }
  };

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

    try {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        throw new Error("URL must start with http:// or https://");
      }

      const { error } = await supabase
        .from("shortened_links")
        .update({
          original_url: url,
          folder_id: folderId === NO_FOLDER_VALUE ? null : folderId,
          domain_id: domainId === DEFAULT_DOMAIN_VALUE ? null : domainId,
        })
        .eq("id", linkId);

      if (error) throw error;

      const selectedDomain =
        domainId === DEFAULT_DOMAIN_VALUE
          ? SHORT_DOMAIN
          : domains.find((d) => d.id === domainId)?.domain || SHORT_DOMAIN;

      toast({
        title: "Success",
        description: `Link updated successfully: http://${selectedDomain}/${shortCode}`,
      });
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("shortened_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
      setShowDeleteDialog(false);
      if (onDelete) onDelete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Edit Link</CardTitle>
        <CardDescription>
          Update your shortened URL and its settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Original URL</Label>
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
            <Label htmlFor="shortCode">Short Code</Label>
            <Input id="shortCode" type="text" value={shortCode} disabled />
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
          <div className="flex justify-between items-center pt-4">
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" type="button">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Are you sure you want to delete this link?
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your shortened link and remove all associated data.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Link"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
