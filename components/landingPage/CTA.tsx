import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold mb-4 text-primary-foreground">
          Ready to Elevate Your Links?
        </h2>
        <p className="mb-8 max-w-2xl mx-auto text-primary-foreground">
          Join thousands of satisfied users and start supercharging your online
          presence with Linkty today.
        </p>
        <Link href="/signup" passHref>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-secondary hover:bg-white/90"
          >
            Start Optimizing for Free
          </Button>
        </Link>
      </div>
    </section>
  );
}
