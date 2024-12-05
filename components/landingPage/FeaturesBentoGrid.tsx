import React from "react";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import {
  IconLink,
  IconChartBar,
  IconBrandChrome,
  IconQrcode,
} from "@tabler/icons-react";

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800"></div>
);

const features = [
  {
    title: "Link Shortening",
    description: "Create concise, memorable links in seconds.",
    icon: <IconLink className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-2",
  },
  {
    title: "Advanced Analytics",
    description:
      "Gain insights with detailed click tracking and geographic data.",
    icon: <IconChartBar className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Custom Domains",
    description: "Use your own domain for branded short links.",
    icon: <IconBrandChrome className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "QR Code Generation",
    description: "Generate QR codes for your shortened links instantly.",
    icon: <IconQrcode className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-2",
  },
];

export function FeaturesBentoGrid() {
  return (
    <div className="w-full  py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          Our Features
        </h2>
        <BentoGrid className="max-w-full">
          {features.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={<Skeleton />}
              className={item.className}
              icon={item.icon}
            />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}
