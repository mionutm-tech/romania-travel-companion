"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { UserMenu } from "@/components/auth/user-menu";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-cream/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest text-cream transition-colors group-hover:bg-forest-light">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="font-serif text-xl font-bold text-forest hidden sm:block">
            Romania
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === link.href
                  ? "text-forest bg-forest/5"
                  : "text-muted-foreground hover:text-forest hover:bg-forest/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && user && (
            <Link href="/saved">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-terracotta">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {!loading && (user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="border-forest/20 text-forest hover:bg-forest hover:text-cream">
                Sign In
              </Button>
            </Link>
          ))}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />} className="md:hidden">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-cream">
              <nav className="flex flex-col gap-1 mt-8">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-4 py-3 text-base font-medium rounded-lg transition-colors",
                      pathname === link.href
                        ? "text-forest bg-forest/5"
                        : "text-muted-foreground hover:text-forest hover:bg-forest/5"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {!loading && user && (
                  <Link
                    href="/saved"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-base font-medium rounded-lg text-muted-foreground hover:text-forest hover:bg-forest/5"
                  >
                    Saved Items
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
