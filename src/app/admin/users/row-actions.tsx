"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Props = {
  id: string;
  role: "user" | "admin";
  disabled: boolean;
  confirmed: boolean;
  isSelf: boolean;
};

export function UserRowActions({ id, role, disabled, confirmed, isSelf }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const run = async (
    key: string,
    url: string,
    init: RequestInit,
    opts?: { confirmMsg?: string; successMsg?: string }
  ) => {
    if (opts?.confirmMsg && !window.confirm(opts.confirmMsg)) return;
    setBusy(key);
    setError(null);
    setToast(null);
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(null);
    if (!res.ok) {
      setError(payload.error ?? "Action failed");
      return;
    }
    if (opts?.successMsg) {
      setToast(opts.successMsg);
      setTimeout(() => setToast(null), 3500);
    }
    router.refresh();
  };

  if (isSelf) {
    return (
      <span
        className="text-xs text-muted-foreground"
        title="You can't modify your own account"
      >
        —
      </span>
    );
  }

  const btn = (key: string, label: string, onClick: () => void, variant: "ghost" | "outline" = "ghost") => (
    <Button
      key={key}
      size="sm"
      variant={variant}
      disabled={busy !== null}
      onClick={onClick}
    >
      {busy === key && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
      {label}
    </Button>
  );

  return (
    <div className="flex flex-wrap justify-end gap-1">
      {btn(
        "role",
        role === "admin" ? "Demote" : "Promote",
        () =>
          run(
            "role",
            `/api/admin/users/${id}`,
            {
              method: "PATCH",
              body: JSON.stringify({
                role: role === "admin" ? "user" : "admin",
              }),
            },
            {
              confirmMsg:
                role === "admin"
                  ? "Demote this admin to a regular user?"
                  : "Promote this user to admin?",
              successMsg:
                role === "admin" ? "Demoted to user" : "Promoted to admin",
            }
          )
      )}
      {btn("reset", "Reset pw", () =>
        run(
          "reset",
          `/api/admin/users/${id}/reset-password`,
          { method: "POST" },
          { successMsg: "Password reset email sent" }
        )
      )}
      {!confirmed &&
        btn("resend", "Resend confirm", () =>
          run(
            "resend",
            `/api/admin/users/${id}/resend-confirmation`,
            { method: "POST" },
            { successMsg: "Confirmation email sent" }
          )
        )}
      {btn(
        "disable",
        disabled ? "Enable" : "Disable",
        () =>
          run(
            "disable",
            `/api/admin/users/${id}`,
            {
              method: "PATCH",
              body: JSON.stringify({ disabled: !disabled }),
            },
            {
              confirmMsg: disabled
                ? undefined
                : "Disable this user? They won't be able to use the app.",
              successMsg: disabled ? "User enabled" : "User disabled",
            }
          ),
        "outline"
      )}
      {toast && (
        <span className="ml-2 self-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          {toast}
        </span>
      )}
      {error && (
        <span
          className="ml-2 self-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
          title={error}
        >
          {error.slice(0, 40)}
        </span>
      )}
    </div>
  );
}
