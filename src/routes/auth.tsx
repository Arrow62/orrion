import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Btn, Field, btn } from "@/components/olyon/ui";
import { Logo } from "@/components/olyon/chrome";
import { useAuth } from "@/lib/auth";
import forestMist from "@/assets/forest-mist.jpg";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["login", "signup"]).optional(), redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — Olyon" },
      { name: "description", content: "Sign in or create your Olyon account to shop, save favourites and track orders." },
      { property: "og:title", content: "Sign in — Olyon" },
      { property: "og:description", content: "Sign in or create your Olyon account." },
    ],
  }),
  component: AuthPage,
});

const safePath = (p?: string) => {
  if (!p) return "/";
  try {
    const u = new URL(p, "http://x");
    return u.pathname.startsWith("/") && !u.pathname.startsWith("//") ? u.pathname + u.search : "/";
  } catch {
    return "/";
  }
};

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z.string().trim().regex(/^[0-9]{10}$/, "Enter a 10-digit phone number"),
    password: z.string().min(8, "At least 8 characters").max(72),
    confirm: z.string(),
    agree: z.literal(true, { message: "Please accept the terms" }),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

function AuthPage() {
  const { mode = "login", redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "", agree: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const target = safePath(redirect);

  useEffect(() => {
    if (user) navigate({ to: target, replace: true });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = (mode === "signup" ? signupSchema : loginSchema).safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { emailRedirectTo: window.location.origin + target, data: { full_name: form.name.trim(), phone: form.phone.trim() } },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      if (!data.session) setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
      setBusy(false);
      if (error) return toast.error(error.message === "Invalid login credentials" ? "Email or password is incorrect" : error.message);
      toast.success("Welcome back");
    }
  };

  const forgot = async () => {
    const email = form.email.trim();
    if (!z.string().email().safeParse(email).success) {
      setErrors({ email: "Enter your email above first" });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your email");
  };

  const oauth = async (provider: "google" | "lovable") => {
    if (redirect) sessionStorage.setItem("olyon-redirect", target);
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (r.error) toast.error(r.error.message ?? "Sign-in failed");
  };

  return (
    <div className="relative -mx-4 min-h-screen overflow-hidden px-6 md:mx-auto md:max-w-md">
      <img src={forestMist} alt="" width={1024} height={640}
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-50 [mask-image:linear-gradient(to_top,black,transparent)]" />
      <div className="relative flex items-center gap-3 pt-6">
        <Link to="/" className="surface grid size-11 place-items-center rounded-full" aria-label="Back to home"><ArrowLeft className="size-5" /></Link>
        <Logo tagline="Viral products ✦ Better you" />
      </div>

      {sent ? (
        <div className="relative py-20 text-center">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-olive text-olive-foreground"><Mail className="size-7" /></div>
          <h1 className="text-4xl">Check your inbox</h1>
          <p className="mt-3 text-muted-foreground">We sent a confirmation link to <strong>{form.email}</strong>. Open it to activate your account.</p>
          <Link to="/auth" search={{ mode: "login", redirect }} className={btn({ variant: "outline", className: "mt-8" })} onClick={() => setSent(false)}>Back to log in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="relative pb-40 pt-8" noValidate>
          <h1 className="text-[2.6rem] leading-tight">{mode === "signup" ? "Create Account" : "Welcome Back"}</h1>
          <p className="mt-2 text-muted-foreground">
            {mode === "signup" ? "Join Olyon for early access to viral products, deals and more." : "Log in to continue your journey with Olyon."}
          </p>
          <div className="mt-7 space-y-3.5">
            {mode === "signup" ? (
              <Field icon={<User className="size-5" />} placeholder="Full Name" autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} />
            ) : null}
            <Field icon={<Mail className="size-5" />} type="email" placeholder="Email Address" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
            {mode === "signup" ? (
              <Field icon={<span className="flex items-center gap-2 text-sm"><Phone className="size-5" />+91</span>} inputMode="numeric" placeholder="Phone Number" autoComplete="tel-national" maxLength={10}
                value={form.phone} onChange={set("phone")} error={errors.phone} />
            ) : null}
            <div className="relative">
              <Field icon={<Lock className="size-5" />} type={show ? "text" : "password"} placeholder={mode === "signup" ? "Create Password" : "Password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"} value={form.password} onChange={set("password")} error={errors.password} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-4 top-4 text-muted-foreground">{show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button>
            </div>
            {mode === "signup" ? (
              <Field icon={<Lock className="size-5" />} type={show ? "text" : "password"} placeholder="Confirm Password" autoComplete="new-password"
                value={form.confirm} onChange={set("confirm")} error={errors.confirm} />
            ) : null}
          </div>
          {mode === "signup" ? (
            <label className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
              <input type="checkbox" checked={form.agree} onChange={set("agree")} className="mt-0.5 size-5 accent-[var(--olive)]" />
              <span>I agree to the Terms &amp; Conditions and Privacy Policy{errors.agree ? <span className="block text-destructive">{errors.agree}</span> : null}</span>
            </label>
          ) : (
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={forgot} className="text-sm font-semibold text-olive">Forgot Password?</button>
            </div>
          )}
          <Btn type="submit" size="lg" className="mt-6 w-full" loading={busy}>
            {mode === "signup" ? "Create Account" : "Log In"} <ArrowRight className="size-5" />
          </Btn>
          <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />OR<span className="h-px flex-1 bg-border" /></div>
          <div className="space-y-3">
            <button type="button" onClick={() => oauth("google")} className={btn({ variant: "outline", size: "lg", className: "w-full" })}>
              <svg className="size-5" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
              Continue with Google
            </button>
            <button type="button" className="lovable-auth-button w-full" onClick={() => oauth("lovable")}>Continue with Lovable</button>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
            <Link to="/auth" search={{ mode: mode === "signup" ? "login" : "signup", redirect }} className="font-semibold text-olive">
              {mode === "signup" ? "Log In" : "Sign Up"}
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
