import { NextResponse, type NextRequest } from "next/server";
import { isErrorResponse, requireAdmin } from "@/lib/auth/require-admin";

export async function POST(request: NextRequest) {
  const ctx = await requireAdmin();
  if (isErrorResponse(ctx)) return ctx;
  const { adminClient } = ctx;

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
    role?: "user" | "admin";
  };
  const email = body.email?.trim();
  const role = body.role === "admin" ? "admin" : "user";
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { name: body.name ?? null },
    redirectTo: `${origin}/auth/confirm`,
  });
  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Invite failed" },
      { status: 400 }
    );
  }

  const { error: upsertErr } = await adminClient
    .from("users")
    .upsert(
      {
        id: data.user.id,
        email,
        name: body.name ?? null,
        role,
      },
      { onConflict: "id" }
    );
  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.user.id });
}
