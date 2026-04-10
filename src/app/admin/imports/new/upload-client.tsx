"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ImportUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/imports", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Upload failed");
      setLoading(false);
      return;
    }
    router.push(`/admin/imports/${json.id}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border/40 bg-card p-6"
    >
      <input
        type="file"
        accept=".csv,.json,text/csv,application/json"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm"
        required
      />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md p-2">{error}</p>
      )}
      <Button
        type="submit"
        disabled={loading || !file}
        className="bg-forest text-cream hover:bg-forest-light"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Upload &amp; preview
      </Button>
    </form>
  );
}
