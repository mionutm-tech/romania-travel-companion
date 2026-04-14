import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminContext = {
  supabase: SupabaseClient;
  adminClient: ReturnType<typeof createAdminClient>;
  user: User;
};

export async function requireAdmin(): Promise<AdminContext | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { supabase, adminClient: createAdminClient(), user };
}

export function isErrorResponse(
  ctx: AdminContext | NextResponse
): ctx is NextResponse {
  return ctx instanceof NextResponse;
}
