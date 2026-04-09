import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Create Account" };

export default function SignupPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-forest text-cream">
            <MapPin className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-forest">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join to save your favorite places and itineraries.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card p-6">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-gold hover:text-terracotta"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
