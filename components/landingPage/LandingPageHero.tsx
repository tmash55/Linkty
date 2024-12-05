import { Button } from "@/components/ui/button";

export function LandingPageHero() {
  return (
    <div className="text-center max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl  mb-4 sm:mb-6">
        Shorten, Share, Succeed
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-primary-foreground mb-6 sm:mb-8 max-w-[600px] mx-auto">
        Transform your long URLs into powerful, trackable short links. Boost
        your online presence and gain valuable insights with our advanced
        analytics.
      </p>
      <Button
        size="lg"
        className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base"
      >
        Get Started
      </Button>
    </div>
  );
}
