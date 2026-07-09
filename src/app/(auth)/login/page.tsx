"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Button, Input, Field, Banner, Icon } from "@/components/ui";

const apiErr = (e: any) =>
  e?.response?.data?.msg ||
  e?.response?.data?.error ||
  e?.response?.data?.message ||
  e?.message ||
  "Something went wrong.";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("token")) router.replace("/discover");
  }, [router]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr(null);
    try {
      await fn();
    } catch (e) {
      setErr(apiErr(e));
    } finally {
      setBusy(false);
    }
  };

  const doLogin = () =>
    run(async () => {
      const { data } = await api.post("/auth/login", { email, password: pw });
      localStorage.setItem("token", data.token);
      setUser(data.user || null);
      router.replace("/discover");
    });

  const doForgotSend = () =>
    run(async () => {
      await api.post("/auth/forgot-password", { email });
      setMsg("We've emailed you a reset code.");
      setForgotStep(2);
    });

  const doReset = () =>
    run(async () => {
      await api.post("/auth/reset-password", { email, code, newPassword: newPw });
      setMsg("Your password has been changed. Please sign in again.");
      setMode("login");
      setForgotStep(1);
      setCode("");
      setNewPw("");
      setPw("");
    });

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center px-5 py-10"
      style={{ background: "var(--bg-subtle)", color: "var(--ink)" }}
    >
      <div className="mb-7 flex flex-col items-center text-center">
        <div className="mb-3 flex items-center gap-2">
          <Icon name="paw" size={28} fill color="var(--brand)" />
          <span className="text-2xl font-extrabold" style={{ letterSpacing: "-0.02em" }}>
            PetDate
          </span>
        </div>
        <h1 className="text-xl font-extrabold" style={{ letterSpacing: "-0.02em" }}>
          Welcome to PetDate
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
          Find your pet a new friend
        </p>
      </div>

      <div
        className="w-full max-w-[440px] rounded-[20px] border p-7"
        style={{ background: "var(--bg)", borderColor: "var(--border)", boxShadow: "var(--sh-card)" }}
      >
        <h2 className="mb-5 text-[17px] font-extrabold">
          {mode === "login" ? "Sign in with email" : "Reset password"}
        </h2>

        {err && <div className="mb-3"><Banner tone="rose">{err}</Banner></div>}
        {msg && !err && <div className="mb-3"><Banner tone="brand">{msg}</Banner></div>}

        {mode === "login" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) doLogin();
            }}
            className="flex flex-col gap-4"
          >
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
            <Button type="submit" size="lg" fullWidth loading={busy}>
              Sign in
            </Button>

            <p className="text-center text-sm" style={{ color: "var(--ink-soft)" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "var(--brand-strong)", fontWeight: 700 }}>
                Sign up
              </Link>
            </p>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setMode("forgot");
                setErr(null);
                setMsg(null);
              }}
            >
              Reset password
            </Button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (busy) return;
              forgotStep === 1 ? doForgotSend() : doReset();
            }}
            className="flex flex-col gap-4"
          >
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={forgotStep === 2}
              />
            </Field>
            {forgotStep === 2 && (
              <>
                <Field label="Verification code">
                  <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" />
                </Field>
                <Field label="New password" hint="At least 6 characters">
                  <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                </Field>
              </>
            )}
            <Button type="submit" size="lg" fullWidth loading={busy}>
              {forgotStep === 1 ? "Send reset code" : "Change password"}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setMode("login");
                setForgotStep(1);
                setErr(null);
                setMsg(null);
              }}
            >
              Back to sign in
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-xs" style={{ color: "var(--ink-faint)" }}>
          By signing up, you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--ink-soft)" }}>Terms of Service</Link>
          {" and "}
          <Link href="/privacy" style={{ color: "var(--ink-soft)" }}>Privacy Policy</Link>
          .
        </p>
      </div>
    </div>
  );
}
