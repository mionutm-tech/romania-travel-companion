"use client";

import { cn } from "@/lib/utils";
import type { POICategory } from "@/types/database";

interface CategoryFilterProps {
  categories: POICategory[];
  selected: string | null;
  onChange: (slug: string | null) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          !selected
            ? "bg-forest text-cream"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onChange(cat.slug === selected ? null : cat.slug)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            cat.slug === selected
              ? "bg-forest text-cream"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
