import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password } = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Invalid credentials" },
      { status: 401 }
    );
  }

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    return NextResponse.json(
      {
        error:
          "Please confirm your email before signing in. Check your inbox for the confirmation link.",
      },
      { status: 403 }
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("disabled_at")
    .eq("id", data.user.id)
    .single();
  if (profile?.disabled_at) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "This account has been disabled. Contact an administrator." },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true });
}
