import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landingPage/Navbar";
import Hero from "@/components/landingPage/Hero";
import Features from "@/components/landingPage/Features";
import Testimonials from "@/components/landingPage/Testimonials";
import CTA from "@/components/landingPage/CTA";

export default function Page() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
    </>
  );
}
