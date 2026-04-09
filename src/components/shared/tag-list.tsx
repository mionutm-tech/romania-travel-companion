import { Badge } from "@/components/ui/badge";
import type { POITag } from "@/types/database";

export function TagList({ tags }: { tags: POITag[] }) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="text-xs font-normal bg-cream-dark text-forest/70 hover:bg-cream-dark"
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
