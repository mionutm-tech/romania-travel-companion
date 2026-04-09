import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-forest text-cream">
            <MapPin className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-forest">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to save places and plan your trip.
          </p>
        </div>

        <div className="rounded-xl border border-border/40 bg-card p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-gold hover:text-terracotta"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
