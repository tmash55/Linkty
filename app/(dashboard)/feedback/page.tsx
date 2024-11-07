import { Metadata } from "next";
import SplitViewFeedback from "@/components/feedback/SplitViewFeedback";

export const metadata: Metadata = {
  title: "Feedback | Linkty",
  description: "Share your thoughts, report issues, or get help with Linkty.",
};

export default function FeedbackPage() {
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Feedback & Support</h1>
      <p className="text-muted-foreground mb-8">
        We value your input. Use this page to submit feedback, report issues, or
        find answers to common questions.
      </p>
      <SplitViewFeedback />
    </div>
  );
}
