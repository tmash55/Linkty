import { Button } from "@/components/ui/button";
import config from "@/config";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary/10 to-primary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
            <span className="block text-foreground">
              Elevate Your Links with
            </span>
            <span className="block text-primary">{config.appName}</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline, analyze, and supercharge your links. Unlock powerful
            insights and drive engagement with our cutting-edge link management
            platform.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/signup" passHref>
                <Button
                  size="lg"
                  className="w-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Start Optimizing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
