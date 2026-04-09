"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedItems } from "@/hooks/use-saved-items";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SaveButtonProps {
  itemId: string;
  itemType: "poi" | "itinerary";
  className?: string;
}

export function SaveButton({ itemId, itemType, className }: SaveButtonProps) {
  const { savedIds, toggleSave, isAuthenticated } = useSavedItems(itemType);
  const router = useRouter();
  const isSaved = savedIds.has(itemId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    await toggleSave(itemId);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn(
        "h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          isSaved ? "fill-terracotta text-terracotta" : "text-forest/60"
        )}
      />
    </Button>
  );
}
