"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/libs/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HelpCircle, Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SplitViewFeedback() {
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        setEmail(user.email || "");
      } else {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/send-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbackType, subject, message, name, email }),
      });

      if (response.ok) {
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback! We'll review it shortly.",
          duration: 5000,
        });
        setSubject("");
        setMessage("");
        setFeedbackType("suggestion");
        if (!isAuthenticated) {
          setName("");
          setEmail("");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send feedback");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
          <CardDescription>
            We value your input. Please share your thoughts, report issues, or
            suggest improvements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Feedback Type</Label>
              <RadioGroup
                value={feedbackType}
                onValueChange={(value) => setFeedbackType(value)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="suggestion" id="suggestion" />
                  <Label htmlFor="suggestion">Suggestion</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="issue" id="issue" />
                  <Label htmlFor="issue">Issue</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="question" id="question" />
                  <Label htmlFor="question">Question</Label>
                </div>
              </RadioGroup>
            </div>
            {!isAuthenticated && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your feedback"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Provide detailed information about your feedback"
                className="min-h-[150px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center">
              <HelpCircle className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>How do I create a new short link?</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Click the "Create New Link" button in the dashboard, paste your
              URL, and click create.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center">
              <HelpCircle className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>Can I customize my short links?</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Yes! When creating a new link, you can specify a custom alias
              instead of using the automatically generated one.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center">
              <HelpCircle className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>How do I track link analytics?</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Click on any link in your dashboard to view detailed statistics
              and analytics.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center">
              <HelpCircle className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>Is there a limit to the number of links I can create?</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              The number of links you can create depends on your plan. Free
              users have a limit, while paid plans offer higher or unlimited
              link creation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
