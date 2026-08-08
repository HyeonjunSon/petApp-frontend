"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Button, Input, Field, Banner, Switch, Icon } from "@/components/ui";

const apiErr = (e: any) =>
  e?.response?.data?.msg ||
  e?.response?.data?.error ||
  e?.response?.data?.message ||
  e?.message ||
  "Something went wrong.";

const RESEND_COOLDOWN = 60; // seconds

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const sendCode = async () => {
    setErr(null);
    setMsg(null);
    if (!email.trim()) return setErr("Please enter your email first.");
    setSending(true);
    try {
      await api.post("/auth/send-code", { email });
      setSent(true);
      startCooldown();
      setMsg("We've emailed you a 6-digit verification code.");
    } catch (e) {
      setErr(apiErr(e));
    } finally {
      setSending(false);
    }
  };

  const submit = async () => {
    setErr(null);
    setMsg(null);
    if (!email.trim()) return setErr("Please enter your email.");
    if (!sent) return setErr("Please send a verification code to your email first.");
    if (!/^\d{6}$/.test(code.trim()))
      return setErr("Please enter the 6-digit verification code.");
    if (pw.length < 6) return setErr("Password must be at least 6 characters.");
    if (pw !== pw2) return setErr("Passwords don't match.");
    if (!agreeTerms || !agreePrivacy)
      return setErr("Please agree to the Terms of Service and Privacy Policy.");

    setBusy(true);
    try {
      await api.post("/auth/verify-code", { email, code: code.trim() });
      const name = email.split("@")[0] || "User";
      const { data } = await api.post("/auth/register", { email, password: pw, name });
      localStorage.setItem("token", data.token);
      setUser(data.user || null);
      router.replace("/onboarding");
    } catch (e) {
      setErr(apiErr(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center px-5 py-10"
      style={{ background: "var(--bg-subtle)", color: "var(--ink)" }}
    >
      <div className="mb-7 flex items-center gap-2">
        <Icon name="paw" size={26} fill color="var(--brand)" />
        <span className="text-xl font-extrabold" style={{ letterSpacing: "-0.02em" }}>
          PetDate
        </span>
      </div>

      <div
        className="w-full max-w-[480px] rounded-[20px] border p-7"
        style={{ background: "var(--bg)", borderColor: "var(--border)", boxShadow: "var(--sh-card)" }}
      >
        <h2 className="mb-5 text-[17px] font-extrabold">Create account</h2>

        {err && <div className="mb-3"><Banner tone="rose">{err}</Banner></div>}
        {msg && !err && <div className="mb-3"><Banner tone="brand">{msg}</Banner></div>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy) submit();
          }}
          className="flex flex-col gap-4"
        >
          <Field label="Email">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
              <Button
                variant="secondary"
                onClick={sendCode}
                loading={sending}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend (${cooldown}s)` : sent ? "Resend code" : "Send code"}
              </Button>
            </div>
          </Field>

          <Field
            label="Verification code"
            hint={sent ? `Enter the 6-digit code we sent to ${email}.` : "Press “Send code” to get a code by email."}
          >
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              placeholder="6 digits"
            />
          </Field>

          <Field label="Password" hint="At least 6 characters">
            <Input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm password">
            <Input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              autoComplete="new-password"
            />
          </Field>

          <div className="flex flex-col gap-3 pt-1">
            <div>
              <Switch on={agreeTerms} onChange={setAgreeTerms} label="Agree to Terms" />
              <p className="mt-1 text-xs" style={{ color: "var(--ink-soft)" }}>
                I agree to the PetDate Terms of Service
              </p>
            </div>
            <div>
              <Switch on={agreePrivacy} onChange={setAgreePrivacy} label="Agree to Privacy Policy" />
              <p className="mt-1 text-xs" style={{ color: "var(--ink-soft)" }}>
                I agree to the Privacy Policy
              </p>
            </div>
          </div>

          <Button type="submit" size="lg" fullWidth loading={busy}>
            Complete sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--ink-soft)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--brand-strong)", fontWeight: 700 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
