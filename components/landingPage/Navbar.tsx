import Link from "next/link";
import { Button } from "@/components/ui/button";
import config from "@/config";

export default function Navbar() {
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              {config.appName}
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="#features"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Features
              </Link>
              <Link
                href="#testimonials"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Testimonials
              </Link>
              <Link
                href="#pricing"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Pricing
              </Link>
            </div>
          </div>
          <div>
            <Link href="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
