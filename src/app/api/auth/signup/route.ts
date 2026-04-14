import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password, name } = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    name?: string;
  };
  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const needsConfirmation =
    !data.session && (data.user?.identities?.length ?? 0) === 0;
  if (needsConfirmation) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, needsConfirmation: !data.session });
}
