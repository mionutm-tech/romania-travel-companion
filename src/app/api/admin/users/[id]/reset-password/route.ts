import { NextResponse, type NextRequest } from "next/server";
import { isErrorResponse, requireAdmin } from "@/lib/auth/require-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireAdmin();
  if (isErrorResponse(ctx)) return ctx;
  const { adminClient } = ctx;

  const { id } = await params;
  const { data: target, error: getErr } = await adminClient.auth.admin.getUserById(id);
  if (getErr || !target.user?.email) {
    return NextResponse.json(
      { error: getErr?.message ?? "User not found" },
      { status: 404 }
    );
  }

  const origin = new URL(request.url).origin;
  const { error } = await adminClient.auth.resetPasswordForEmail(target.user.email, {
    redirectTo: `${origin}/auth/confirm?next=/account`,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
