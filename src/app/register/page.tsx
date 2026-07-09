"use client";

import { useState } from "react";
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

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [code, setCode] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

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

  const next = () => {
    setErr(null);
    if (!email.trim()) return setErr("Please enter your email.");
    if (pw.length < 6) return setErr("Password must be at least 6 characters.");
    if (pw !== pw2) return setErr("Passwords don't match.");
    if (!agreeTerms || !agreePrivacy)
      return setErr("Please agree to the Terms of Service and Privacy Policy.");
    run(async () => {
      await api.post("/auth/send-code", { email });
      setMsg("We've emailed you a verification code.");
      setStep("verify");
    });
  };

  const finish = () =>
    run(async () => {
      await api.post("/auth/verify-code", { email, code });
      const name = email.split("@")[0] || "User";
      const { data } = await api.post("/auth/register", { email, password: pw, name });
      localStorage.setItem("token", data.token);
      setUser(data.user || null);
      router.replace("/onboarding");
    });

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

        {step === "form" ? (
          <div className="flex flex-col gap-4">
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label="Password" hint="At least 6 characters">
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </Field>
            <Field label="Confirm password">
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
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

            <div className="mt-2 flex items-center justify-between">
              <Button variant="secondary" onClick={() => router.push("/login")}>
                Cancel
              </Button>
              <Button onClick={next} loading={busy}>
                Next
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) finish();
            }}
            className="flex flex-col gap-4"
          >
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Enter the verification code we sent to <b style={{ color: "var(--ink)" }}>{email}</b>.
            </p>
            <Field label="Verification code">
              <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" placeholder="6 digits" />
            </Field>
            <Button type="submit" size="lg" fullWidth loading={busy}>
              Complete sign up
            </Button>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep("form")}>
                Back
              </Button>
              <Button
                variant="ghost"
                onClick={() => run(async () => {
                  await api.post("/auth/send-code", { email });
                  setMsg("We've resent the verification code.");
                })}
              >
                Resend code
              </Button>
            </div>
          </form>
        )}

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
