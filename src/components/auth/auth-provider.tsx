"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { SupabaseClient, User as AuthUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types/database";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

function fallbackUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    email: authUser.email ?? "",
    name: (authUser.user_metadata?.name as string | undefined) ?? null,
    avatar_url: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
    role: "user",
    created_at: authUser.created_at ?? new Date().toISOString(),
  };
}

async function loadProfile(
  supabase: SupabaseClient,
  authUser: AuthUser
): Promise<User> {
  try {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();
    if (data) return data as User;
  } catch {
    // swallow — fall back to auth metadata below
  }
  return fallbackUser(authUser);
}

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser?.id, initialUser?.role, initialUser?.name, initialUser?.avatar_url]);

  useEffect(() => {
    let cancelled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const profile = await loadProfile(supabase, session.user);
          if (!cancelled) setUser(profile);
        } else if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    if (typeof window !== "undefined") window.location.assign("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
