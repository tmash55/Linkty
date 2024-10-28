import React from "react";
import { Link, BarChart, Zap } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center mb-12 text-foreground">
          Powerful Features
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<Link className="h-6 w-6 text-primary" />}
            title="Link Shortening"
            description="Create concise, memorable links that are easy to share across all platforms."
          />
          <FeatureCard
            icon={<BarChart className="h-6 w-6 text-primary" />}
            title="Advanced Analytics"
            description="Gain deep insights into your audience with comprehensive click data and geographic information."
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-primary" />}
            title="Fast and Reliable"
            description="Experience lightning-fast redirects and 99.9% uptime for your shortened links."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-muted">
      <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
