import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Btn, Field } from "@/components/olyon/ui";
import { Logo } from "@/components/olyon/chrome";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Olyon" },
      { name: "description", content: "Choose a new password for your Olyon account." },
      { property: "og:title", content: "Reset password — Olyon" },
      { property: "og:description", content: "Choose a new password for your Olyon account." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setErr("At least 8 characters");
    if (pw !== confirm) return setErr("Passwords don't match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/" });
  };
  return (
    <form onSubmit={submit} className="mx-auto max-w-md py-10">
      <Logo />
      <h1 className="mt-10 text-4xl">Set a new password</h1>
      <p className="mt-2 text-muted-foreground">Open this page from the link in your email.</p>
      <div className="mt-6 space-y-3">
        <Field icon={<Lock className="size-5" />} type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
        <Field icon={<Lock className="size-5" />} type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={err} autoComplete="new-password" />
      </div>
      <Btn type="submit" size="lg" className="mt-6 w-full" loading={busy}>Update password</Btn>
    </form>
  );
}
