"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Clock,
  Zap,
  Star,
  Rocket,
  ThumbsUp,
  Link,
  Target,
  MessageSquare,
  Eye,
  Activity,
  SplitSquareVertical,
  Lock,
  LucideIcon,
} from "lucide-react";

interface Feature {
  title: string;
  description: string;
  status: "Planned" | "Coming Soon" | "In Progress";
  icon: LucideIcon;
}

const features: Feature[] = [
  {
    title: "Link Expiration",
    description: "Set expiration dates for your short links",
    status: "Planned",
    icon: Clock,
  },
  {
    title: "API Access",
    description: "Integrate Linkty with your own applications",
    status: "Planned",
    icon: Rocket,
  },
  {
    title: "Team Collaboration",
    description: "Work together with your team on link management",
    status: "Planned",
    icon: ThumbsUp,
  },
  {
    title: "Link in Bio",
    description: "Create a customizable landing page with multiple links",
    status: "Planned",
    icon: Link,
  },
  {
    title: "Retargeting",
    description: "Target users based on device, location, and time",
    status: "Coming Soon",
    icon: Target,
  },
  {
    title: "CTA Overlays",
    description: "Add custom call-to-action overlays on destination pages",
    status: "Planned",
    icon: MessageSquare,
  },
  {
    title: "Password Protection",
    description: "Secure links with password access",
    status: "In Progress",
    icon: Lock,
  },
  {
    title: "Link Cloaking",
    description: "Hide original URLs for enhanced privacy and branding",
    status: "Coming Soon",
    icon: Eye,
  },
  {
    title: "Event Stream",
    description: "Real-time tracking of link interactions and events",
    status: "In Progress",
    icon: Activity,
  },
  {
    title: "A/B Testing",
    description: "Compare performance of different link variations",
    status: "In Progress",
    icon: SplitSquareVertical,
  },
];

const columns = [
  {
    title: "Planned",
    color: "bg-muted text-muted-foreground",
    headerColor: "text-secondary",
  },
  {
    title: "Coming Soon",
    color: "bg-secondary text-secondary-foreground",
    headerColor: "text-secondary-foreground",
  },
  {
    title: "In Progress",
    color: "bg-primary text-primary-foreground",
    headerColor: "text-primary-foreground",
  },
];

export default function KanbanRoadmap() {
  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {columns.map((column) => (
          <div key={column.title} className={`${column.color} p-4 rounded-lg`}>
            <h2 className={`text-2xl font-semibold mb-4 ${column.headerColor}`}>
              {column.title}
            </h2>
            <div className="space-y-4">
              {features
                .filter((feature) => feature.status === column.title)
                .map((feature, index) => (
                  <Card
                    key={index}
                    className="bg-card transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:z-10"
                  >
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                      {React.createElement(feature.icon, {
                        className:
                          "h-6 w-6 mr-2 text-accent transition-transform duration-300 ease-in-out group-hover:scale-110",
                      })}
                      <CardTitle className="text-card-foreground group-hover:text-accent transition-colors duration-300 ease-in-out">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-muted-foreground group-hover:text-card-foreground transition-colors duration-300 ease-in-out">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
