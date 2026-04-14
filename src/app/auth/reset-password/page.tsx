import { ResetPasswordForm } from "./form";

export const metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-2xl font-bold text-forest mb-2">
        Set a new password
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Enter a new password for your account. You&apos;ll stay signed in
        afterwards.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
