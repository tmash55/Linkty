import KanbanRoadmap from "@/components/roadmap/KanbanRoadmap";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Roadmap | Linkty",
  description: "View our product roadmap and upcoming features.",
};

export default function RoadmapPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Product Roadmap</h1>
      <p className="text-muted-foreground mb-8">
        Stay updated on our latest features and upcoming developments.
      </p>
      <KanbanRoadmap />

      <div className="mt-12 bg-muted rounded-lg p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Have a feature suggestion?
        </h2>
        <p className="text-muted-foreground mb-6">
          We&apos;d love to hear your ideas! Help shape the future of Linkty by
          sharing your feedback.
        </p>
        <Button asChild>
          <Link href="/feedback">
            <MessageSquare className="mr-2 h-4 w-4" />
            Provide Feedback
          </Link>
        </Button>
      </div>
    </div>
  );
}
