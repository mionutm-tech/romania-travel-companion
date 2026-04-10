import { Badge } from "@/components/ui/badge";
import type {
  PublishStatus,
  DataQualityStatus,
} from "@/types/database";

const PUBLISH_STYLES: Record<PublishStatus, string> = {
  draft: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  review: "bg-blue-100 text-blue-900 hover:bg-blue-100",
  published: "bg-green-100 text-green-900 hover:bg-green-100",
};

const QUALITY_STYLES: Record<DataQualityStatus, string> = {
  raw: "bg-zinc-100 text-zinc-700 hover:bg-zinc-100",
  enriched: "bg-purple-100 text-purple-900 hover:bg-purple-100",
  reviewed: "bg-teal-100 text-teal-900 hover:bg-teal-100",
};

export function PublishStatusBadge({ status }: { status: PublishStatus }) {
  return (
    <Badge variant="secondary" className={PUBLISH_STYLES[status]}>
      {status}
    </Badge>
  );
}

export function DataQualityBadge({ status }: { status: DataQualityStatus }) {
  return (
    <Badge variant="secondary" className={QUALITY_STYLES[status]}>
      {status}
    </Badge>
  );
}
