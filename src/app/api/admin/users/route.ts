import { NextResponse, type NextRequest } from "next/server";
import { isErrorResponse, requireAdmin } from "@/lib/auth/require-admin";

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const ctx = await requireAdmin();
  if (isErrorResponse(ctx)) return ctx;
  const { supabase, adminClient } = ctx;

  const page = Math.max(
    1,
    Number(new URL(request.url).searchParams.get("page") ?? "1")
  );

  const { data: profiles, error } = await supabase
    .from("users")
    .select("id, email, name, avatar_url, role, disabled_at, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: authList, error: authErr } = await adminClient.auth.admin.listUsers({
    page,
    perPage: PAGE_SIZE,
  });
  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 500 });
  }

  const authById = new Map(authList.users.map((u) => [u.id, u]));
  const merged = (profiles ?? []).map((p) => {
    const a = authById.get(p.id);
    return {
      ...p,
      email_confirmed_at: a?.email_confirmed_at ?? null,
      last_sign_in_at: a?.last_sign_in_at ?? null,
    };
  });

  return NextResponse.json({ users: merged, page });
}
