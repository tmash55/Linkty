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
import { Trash2 } from "lucide-react";

interface Domain {
  id: string;
  domain: string;
  is_verified: boolean;
}

export function DomainManager() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user found");
      setError("You must be logged in to manage domains");
      return;
    }

    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching domains:", error);
      setError("Failed to fetch domains");
    } else {
      setDomains(data || []);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No authenticated user found");
      }

      const { data, error } = await supabase
        .from("domains")
        .insert({ domain: newDomain, user_id: user.id })
        .select();

      if (error) throw error;

      setDomains([...domains, data[0]]);
      setNewDomain("");
    } catch (error) {
      console.error("Error adding domain:", error);
      setError("Failed to add domain");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDomain = async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase
        .from("domains")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setDomains(domains.filter((domain) => domain.id !== id));
    } catch (error) {
      console.error("Error deleting domain:", error);
      setError("Failed to delete domain");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Custom Domains</CardTitle>
        <CardDescription>
          Add and manage your custom domains for shortened links
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddDomain} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newDomain">New Domain</Label>
            <Input
              id="newDomain"
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              required
              placeholder="example.com"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Domain"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-2">Your Domains</h3>
          {domains.length === 0 ? (
            <p>You haven&apos;t added any custom domains yet.</p>
          ) : (
            <ul className="space-y-2">
              {domains.map((domain) => (
                <li
                  key={domain.id}
                  className="flex justify-between items-center"
                >
                  <span>{domain.domain}</span>
                  <div>
                    <span
                      className={`mr-2 ${
                        domain.is_verified
                          ? "text-green-500"
                          : "text-yellow-500"
                      }`}
                    >
                      {domain.is_verified ? "Verified" : "Pending"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDomain(domain.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
