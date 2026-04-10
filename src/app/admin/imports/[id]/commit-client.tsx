"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function CommitButton({
  jobId,
  readyCount,
}: {
  jobId: string;
  readyCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCommit = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/imports/${jobId}/commit`, {
      method: "POST",
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Commit failed");
      setLoading(false);
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleCommit}
        disabled={loading}
        className="bg-forest text-cream hover:bg-forest-light"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Commit {readyCount} ready row{readyCount === 1 ? "" : "s"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
