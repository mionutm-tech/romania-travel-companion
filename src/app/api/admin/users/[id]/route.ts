import { NextResponse, type NextRequest } from "next/server";
import { isErrorResponse, requireAdmin } from "@/lib/auth/require-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireAdmin();
  if (isErrorResponse(ctx)) return ctx;
  const { adminClient, user } = ctx;

  const { id } = await params;
  if (id === user.id) {
    return NextResponse.json(
      { error: "You can't modify your own account" },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    role?: "user" | "admin";
    disabled?: boolean;
  };

  const patch: Record<string, unknown> = {};
  if (body.role === "user" || body.role === "admin") patch.role = body.role;
  if (typeof body.disabled === "boolean") {
    patch.disabled_at = body.disabled ? new Date().toISOString() : null;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await adminClient.from("users").update(patch).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireAdmin();
  if (isErrorResponse(ctx)) return ctx;
  const { adminClient, user } = ctx;

  const { id } = await params;
  if (id === user.id) {
    return NextResponse.json(
      { error: "You can't delete your own account" },
      { status: 400 }
    );
  }

  const { error } = await adminClient.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
