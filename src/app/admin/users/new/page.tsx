import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InviteUserForm } from "./form";

export default function NewAdminUserPage() {
  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-forest mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>
      <h1 className="font-serif text-2xl font-bold text-forest mb-6">
        Invite User
      </h1>
      <InviteUserForm />
    </div>
  );
}
