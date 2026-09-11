import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/locale-provider";
import { adminLoginFn } from "@/lib/fns";

export function LoginForm() {
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await adminLoginFn({ data: { email, password } });
      await router.invalidate();
    } catch {
      setError(t.admin.invalid);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl bg-card p-6 shadow-[var(--shadow-border)] sm:p-8"
      >
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {t.nav.admin}
        </p>
        <h1 className="mt-2 font-display text-3xl">{t.admin.loginTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.admin.loginSubtitle}</p>
        <div className="mt-6 grid gap-4">
          <div>
            <Label htmlFor="email">{t.admin.email}</Label>
            <Input
              id="email"
              className="mt-2"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">{t.admin.password}</Label>
            <Input
              id="password"
              className="mt-2"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? t.admin.signingIn : t.admin.signIn}
          </Button>
        </div>
      </form>
    </div>
  );
}
