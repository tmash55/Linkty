"use client";

import CTA from "@/components/CTA";
import Navbar from "@/components/landingPage/Navbar";
import { FeaturesBentoGrid } from "@/components/landingPage/FeaturesBentoGrid";
import Footer from "@/components/Footer";
import { LandingPageHero } from "@/components/landingPage/LandingPageHero";
import { BackgroundLines } from "@/components/ui/background-lines";
import { TestimonialScroll } from "@/components/landingPage/TestimonialScroll";
import WorldMap from "@/components/landingPage/WorldMap";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="flex-grow pt-16">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <BackgroundLines className="absolute inset-0">
            <div className="relative z-10 flex items-center justify-center w-full h-full px-4 py-12 sm:py-16 md:py-24 lg:py-32">
              <LandingPageHero />
            </div>
          </BackgroundLines>
        </section>
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24 lg:py-32">
          <section id="features">
            <FeaturesBentoGrid />
          </section>
          <section>
            <div className="max-w-7xl mx-auto text-center">
              <p className="font-bold text-xl md:text-4xl dark:text-white text-black">
                Global{" "}
                <span className="text-neutral-400">
                  {"Reach".split("").map((letter, idx) => (
                    <motion.span
                      key={idx}
                      className="inline-block"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: idx * 0.04 }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              </p>
              <p className="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto py-4">
                Share and track your shortened links anywhere in the world. Get
                real-time insights into your link performance, no matter where
                your audience is located.
              </p>
            </div>
            <WorldMap
              lineColor="#45E561"
              dots={[
                {
                  start: {
                    lat: 64.2008,
                    lng: -149.4937,
                  }, // Alaska (Fairbanks)
                  end: {
                    lat: 34.0522,
                    lng: -118.2437,
                  }, // Los Angeles
                },
                {
                  start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
                  end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                },
                {
                  start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                  end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
                },
                {
                  start: { lat: 51.5074, lng: -0.1278 }, // London
                  end: { lat: 28.6139, lng: 77.209 }, // New Delhi
                },
                {
                  start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                  end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
                },
                {
                  start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                  end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
                },
              ]}
            />
          </section>
          <section id="testimonials">
            <TestimonialScroll />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
