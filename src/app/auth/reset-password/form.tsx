"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateErr) {
      setError(updateErr.message);
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1200);
  };

  if (done) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-6 text-center">
        <p className="font-semibold text-forest">Password updated.</p>
        <p className="mt-1 text-sm text-muted-foreground">Redirecting…</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border/40 bg-card p-6"
    >
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          className="mt-1.5"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md p-2">{error}</p>
      )}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-forest text-cream hover:bg-forest-light"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update password
      </Button>
    </form>
  );
}
