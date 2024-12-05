"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import config from "@/config";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              {config.appName}
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavItem
                sectionId="features"
                label="Features"
                scrollToSection={scrollToSection}
              />
              <NavItem
                sectionId="testimonials"
                label="Testimonials"
                scrollToSection={scrollToSection}
              />
              <NavItem
                sectionId="faq"
                label="FAQ"
                scrollToSection={scrollToSection}
              />
            </div>
          </div>
          <div className="hidden md:block">
            <Link href="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <motion.div
          className="md:hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavItem
              sectionId="features"
              label="Features"
              scrollToSection={scrollToSection}
              mobile
            />
            <NavItem
              sectionId="testimonials"
              label="Testimonials"
              scrollToSection={scrollToSection}
              mobile
            />
            <NavItem
              sectionId="pricing"
              label="Pricing"
              scrollToSection={scrollToSection}
              mobile
            />
            <Link href="/signup">
              <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

function NavItem({
  sectionId,
  label,
  scrollToSection,
  mobile = false,
}: {
  sectionId: string;
  label: string;
  scrollToSection: (sectionId: string) => void;
  mobile?: boolean;
}) {
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <button
          onClick={() => scrollToSection(sectionId)}
          className={`${
            mobile
              ? "block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              : "text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          }`}
        >
          {label}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{label}</h3>
          <p className="text-sm">
            Explore our {label.toLowerCase()} and see how we can help you
            succeed.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
