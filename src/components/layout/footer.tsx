import Link from "next/link";
import { MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-forest text-cream/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream/10">
                <MapPin className="h-4 w-4 text-gold" />
              </div>
              <span className="font-serif text-lg font-bold text-cream">
                Romania
              </span>
            </div>
            <p className="text-sm text-cream/60 leading-relaxed">
              Your curated guide to discovering Romania&apos;s most captivating
              destinations, from Bucharest&apos;s vibrant culture to
              Transylvania&apos;s timeless charm.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-cream mb-4 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/destinations" className="hover:text-gold transition-colors">Destinations</Link></li>
              <li><Link href="/map" className="hover:text-gold transition-colors">Discovery Map</Link></li>
              <li><Link href="/itineraries" className="hover:text-gold transition-colors">Itineraries</Link></li>
              <li><Link href="/planner" className="hover:text-gold transition-colors">Trip Planner</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-cream mb-4 uppercase tracking-wider">
              Destinations
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/destinations/bucharest" className="hover:text-gold transition-colors">Bucharest</Link></li>
              <li><Link href="/destinations/brasov" className="hover:text-gold transition-colors">Bra&#x219;ov</Link></li>
              <li><Link href="/destinations/sibiu" className="hover:text-gold transition-colors">Sibiu</Link></li>
              <li><Link href="/destinations/cluj-napoca" className="hover:text-gold transition-colors">Cluj-Napoca</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-cream mb-4 uppercase tracking-wider">
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/saved" className="hover:text-gold transition-colors">Saved Items</Link></li>
              <li><Link href="/auth/login" className="hover:text-gold transition-colors">Sign In</Link></li>
              <li><Link href="/auth/signup" className="hover:text-gold transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-cream/10 pt-8 text-center text-xs text-cream/40">
          &copy; {new Date().getFullYear()} Romania Travel Companion. Built with care for travelers.
        </div>
      </div>
    </footer>
  );
}
