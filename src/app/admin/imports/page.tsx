import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default async function AdminImportsPage() {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("import_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-forest">
          POI imports
        </h1>
        <Link href="/admin/imports/new">
          <Button className="bg-forest text-cream hover:bg-forest-light">
            <Plus className="mr-2 h-4 w-4" />
            New import
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-semibold text-forest">File</th>
              <th className="text-left p-3 font-semibold text-forest">
                Format
              </th>
              <th className="text-left p-3 font-semibold text-forest">
                Status
              </th>
              <th className="text-left p-3 font-semibold text-forest">Rows</th>
              <th className="text-left p-3 font-semibold text-forest">
                Imported
              </th>
              <th className="text-left p-3 font-semibold text-forest">
                Failed
              </th>
              <th className="text-left p-3 font-semibold text-forest">
                Created
              </th>
              <th className="text-right p-3 font-semibold text-forest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {(jobs || []).map((job) => (
              <tr key={job.id} className="border-t border-border/20">
                <td className="p-3 font-medium">{job.filename}</td>
                <td className="p-3 text-muted-foreground">{job.format}</td>
                <td className="p-3">
                  <Badge variant="secondary" className="text-xs">
                    {job.status}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">{job.total_rows}</td>
                <td className="p-3 text-muted-foreground">
                  {job.imported_rows}
                </td>
                <td className="p-3 text-muted-foreground">{job.failed_rows}</td>
                <td className="p-3 text-muted-foreground text-xs">
                  {new Date(job.created_at).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/imports/${job.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {(jobs || []).length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-6 text-center text-muted-foreground"
                >
                  No imports yet.{" "}
                  <Link
                    href="/admin/imports/new"
                    className="text-forest underline"
                  >
                    Upload your first CSV
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
