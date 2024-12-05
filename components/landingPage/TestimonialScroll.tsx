"use client";

import React from "react";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";

const testimonials = [
  {
    quote:
      "This link shortener has revolutionized our marketing campaigns. We've seen a 40% increase in click-through rates!",
    name: "Sarah Johnson",
    title: "Marketing Director, TechCorp",
  },
  {
    quote:
      "The analytics provided are incredibly detailed. It's helped us understand our audience better than ever before.",
    name: "Michael Chen",
    title: "Data Analyst, DataDrive Inc.",
  },
  {
    quote:
      "I love how easy it is to create custom short links. It's greatly improved our brand consistency across all channels.",
    name: "Emily Rodriguez",
    title: "Social Media Manager, BrandBoost",
  },
  {
    quote:
      "The QR code feature is a game-changer for our print marketing. We're seeing much higher engagement rates.",
    name: "David Kim",
    title: "Print Marketing Specialist, AdPrint Co.",
  },
  {
    quote:
      "This tool has simplified our affiliate marketing tracking. It's saving us hours of work every week.",
    name: "Lisa Thompson",
    title: "Affiliate Program Manager, E-commerce Giant",
  },
];

export function TestimonialScroll() {
  return (
    <div className="h-[40rem] w-full rounded-md flex flex-col antialiased  items-center justify-center relative overflow-hidden">
      <h2 className="text-3xl font-bold text-center mb-8 relative z-10">
        What Our Users Say
      </h2>
      <div className="relative w-full overflow-hidden h-[30rem]">
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </div>
    </div>
  );
}
