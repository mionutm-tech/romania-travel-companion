import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { CommitButton } from "./commit-client";

export default async function ImportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("import_jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (!job) notFound();

  const { data: rows } = await supabase
    .from("import_rows")
    .select("*")
    .eq("job_id", id)
    .order("row_index");

  const ready = (rows ?? []).filter((r) => r.status === "ready").length;
  const errored = (rows ?? []).filter((r) => r.status === "error").length;
  const imported = (rows ?? []).filter((r) => r.status === "imported").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-forest">
            {job.filename}
          </h1>
          <p className="text-sm text-muted-foreground">
            {job.format.toUpperCase()} · {job.total_rows} rows ·{" "}
            <Badge variant="secondary">{job.status}</Badge>
          </p>
        </div>
        <Link
          href="/admin/imports"
          className="text-sm text-muted-foreground hover:text-forest"
        >
          ← Back
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Ready</p>
          <p className="text-2xl font-bold text-forest">{ready}</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Errors</p>
          <p className="text-2xl font-bold text-red-600">{errored}</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">Imported</p>
          <p className="text-2xl font-bold text-green-700">{imported}</p>
        </div>
      </div>

      {job.status !== "committed" && ready > 0 && (
        <CommitButton jobId={id} readyCount={ready} />
      )}

      <div className="mt-6 rounded-xl border border-border/40 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-semibold text-forest">#</th>
              <th className="text-left p-3 font-semibold text-forest">Name</th>
              <th className="text-left p-3 font-semibold text-forest">
                Destination
              </th>
              <th className="text-left p-3 font-semibold text-forest">
                Category
              </th>
              <th className="text-left p-3 font-semibold text-forest">
                Status
              </th>
              <th className="text-left p-3 font-semibold text-forest">Error</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => {
              const raw = (row.raw ?? {}) as Record<string, string>;
              return (
                <tr key={row.id} className="border-t border-border/20">
                  <td className="p-3 text-muted-foreground">{row.row_index + 1}</td>
                  <td className="p-3 font-medium">{raw.name || "-"}</td>
                  <td className="p-3 text-muted-foreground">
                    {raw.destination_slug || "-"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {raw.category_slug || "-"}
                  </td>
                  <td className="p-3">
                    <Badge
                      variant="secondary"
                      className={
                        row.status === "error"
                          ? "bg-red-100 text-red-900"
                          : row.status === "imported"
                            ? "bg-green-100 text-green-900"
                            : ""
                      }
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-red-600">{row.error || ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
