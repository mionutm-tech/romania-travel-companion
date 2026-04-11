import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Route } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden editorial-gradient py-20 sm:py-28 lg:py-36">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-10 right-20 h-96 w-96 rounded-full bg-sage blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-1.5 text-sm font-medium text-gold backdrop-blur-sm border border-cream/10">
            <MapPin className="h-3.5 w-3.5" />
            Your curated guide to Romania
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-cream leading-[1.1]">
            Discover{" "}
            <span className="text-gold">Romania&apos;s</span>{" "}
            hidden treasures
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-cream/70 leading-relaxed max-w-xl">
            From Bucharest&apos;s vibrant streets to Transylvania&apos;s
            medieval charm. Plan your journey with curated POIs, editorial
            itineraries, and local insights.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/map">
              <Button
                size="lg"
                className="gold-gradient text-forest font-semibold border-0 hover:opacity-90 px-6"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Explore the Map
              </Button>
            </Link>
            <Link href="/itineraries">
              <Button
                size="lg"
                className="gold-gradient text-forest font-semibold border-0 hover:opacity-90 px-6"
              >
                <Route className="mr-2 h-4 w-4" />
                Browse Itineraries
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
