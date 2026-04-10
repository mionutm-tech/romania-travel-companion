import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCsv, parseJson, validateAll } from "@/lib/importer";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Unauthorized", status: 401 as const };
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return { supabase, error: "Forbidden", status: 403 as const };
  return { supabase, user };
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { supabase, user } = auth;

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  const text = await file.text();
  const filename = file.name || "upload";
  const format: "csv" | "json" = filename.toLowerCase().endsWith(".json")
    ? "json"
    : "csv";

  let rawRows: Record<string, string>[];
  try {
    rawRows = format === "json" ? parseJson(text) : parseCsv(text);
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to parse ${format}: ${(e as Error).message}` },
      { status: 400 }
    );
  }

  const parsed = validateAll(rawRows);
  const failed = parsed.filter((p) => p.error).length;

  const { data: job, error: jobErr } = await supabase
    .from("import_jobs")
    .insert({
      created_by: user.id,
      filename,
      format,
      total_rows: parsed.length,
      failed_rows: failed,
      status: "previewing",
    })
    .select()
    .single();

  if (jobErr || !job) {
    return NextResponse.json(
      { error: jobErr?.message || "Failed to create job" },
      { status: 500 }
    );
  }

  if (parsed.length > 0) {
    const { error: rowsErr } = await supabase.from("import_rows").insert(
      parsed.map((p, i) => ({
        job_id: job.id,
        row_index: i,
        raw: p.raw,
        parsed: p.parsed ?? null,
        status: p.error ? "error" : "ready",
        error: p.error ?? null,
      }))
    );
    if (rowsErr) {
      return NextResponse.json(
        { error: rowsErr.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ id: job.id }, { status: 201 });
}
