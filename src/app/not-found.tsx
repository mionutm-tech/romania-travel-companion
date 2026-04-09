import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <MapPin className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="font-serif text-4xl font-bold text-forest">
        Page Not Found
      </h1>
      <p className="mt-3 text-muted-foreground max-w-md">
        The page you&apos;re looking for doesn&apos;t exist. Perhaps you took a
        wrong turn on the road to Transylvania?
      </p>
      <Link href="/" className="mt-8">
        <Button className="bg-forest text-cream hover:bg-forest-light">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
