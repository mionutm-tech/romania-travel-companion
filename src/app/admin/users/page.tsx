import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { UserRowActions } from "./row-actions";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin";
  disabled_at: string | null;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user: me },
  } = await supabase.auth.getUser();

  const { data: profiles } = await supabase
    .from("users")
    .select("id, email, name, role, disabled_at, created_at")
    .order("created_at", { ascending: false });

  const adminClient = createAdminClient();
  const { data: authList } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const authById = new Map(
    (authList?.users ?? []).map((u) => [u.id, u] as const)
  );

  const users: UserRow[] = (profiles ?? []).map((p) => {
    const a = authById.get(p.id);
    return {
      ...(p as Omit<UserRow, "email_confirmed_at" | "last_sign_in_at">),
      email_confirmed_at: a?.email_confirmed_at ?? null,
      last_sign_in_at: a?.last_sign_in_at ?? null,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-forest">Users</h1>
        <Link href="/admin/users/new">
          <Button className="bg-forest text-cream hover:bg-forest-light">
            <Plus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-semibold text-forest">Name</th>
              <th className="text-left p-3 font-semibold text-forest">Email</th>
              <th className="text-left p-3 font-semibold text-forest">Role</th>
              <th className="text-left p-3 font-semibold text-forest">
                Confirmed
              </th>
              <th className="text-left p-3 font-semibold text-forest">
                Last sign-in
              </th>
              <th className="text-left p-3 font-semibold text-forest">
                Status
              </th>
              <th className="text-right p-3 font-semibold text-forest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = me?.id === u.id;
              return (
                <tr key={u.id} className="border-t border-border/20">
                  <td className="p-3 font-medium">
                    {u.name || "—"}
                    {isSelf && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={
                        u.role === "admin"
                          ? "rounded-full bg-forest/10 px-2 py-0.5 text-xs font-semibold text-forest"
                          : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {u.email_confirmed_at ? "Yes" : "No"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {formatDate(u.last_sign_in_at)}
                  </td>
                  <td className="p-3">
                    {u.disabled_at ? (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                        Disabled
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <UserRowActions
                      id={u.id}
                      role={u.role}
                      disabled={!!u.disabled_at}
                      confirmed={!!u.email_confirmed_at}
                      isSelf={isSelf}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
