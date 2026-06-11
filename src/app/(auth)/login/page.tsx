"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Button, Input, Field, Banner, Badge, cx } from "@/components/ui";

type Mode = "login" | "register" | "forgot";

export default function AuthPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [code, setCode] = useState("");

  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [busy, setBusy] = useState<"" | "send" | "verify" | "submit">("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const resetFlow = (next: Mode) => {
    setMode(next);
    setErr("");
    setInfo("");
    setCode("");
    setPw("");
    setPw2("");
    setCodeSent(false);
    setEmailVerified(false);
  };

  const errMsg = (e: any, fallback: string) =>
    e?.response?.data?.msg || e?.response?.data?.message || fallback;

  const doLogin = async () => {
    setBusy("submit");
    setErr("");
    try {
      const { data } = await api.post("/auth/login", { email, password: pw });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      router.replace("/dashboard");
    } catch (e) {
      setErr(errMsg(e, "Incorrect email or password."));
    } finally {
      setBusy("");
    }
  };

  const sendCode = async () => {
    setBusy("send");
    setErr("");
    setInfo("");
    try {
      await api.post("/auth/send-code", { email });
      setCodeSent(true);
      setInfo("We sent a verification code to your email. (valid for 10 min)");
    } catch (e) {
      setErr(errMsg(e, "Failed to send the verification code."));
    } finally {
      setBusy("");
    }
  };

  const verifyCode = async () => {
    setBusy("verify");
    setErr("");
    try {
      await api.post("/auth/verify-code", { email, code });
      setEmailVerified(true);
      setInfo("Email verified ✓");
    } catch (e) {
      setErr(errMsg(e, "The verification code doesn't match."));
    } finally {
      setBusy("");
    }
  };

  const doRegister = async () => {
    if (!emailVerified) return setErr("Please verify your email first.");
    if (!name.trim()) return setErr("Please enter your name.");
    if (pw.length < 6) return setErr("Password must be at least 6 characters.");
    if (pw !== pw2) return setErr("Passwords do not match.");
    setBusy("submit");
    setErr("");
    try {
      const { data } = await api.post("/auth/register", { email, password: pw, name });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      router.replace("/onboarding");
    } catch (e) {
      setErr(errMsg(e, "Sign up failed."));
    } finally {
      setBusy("");
    }
  };

  const sendResetCode = async () => {
    setBusy("send");
    setErr("");
    setInfo("");
    try {
      await api.post("/auth/forgot-password", { email });
      setCodeSent(true);
      setInfo("If this email is registered, we sent a code. (valid for 10 min)");
    } catch (e) {
      setErr(errMsg(e, "Failed to send the code."));
    } finally {
      setBusy("");
    }
  };

  const doReset = async () => {
    if (!code.trim()) return setErr("Please enter the verification code.");
    if (pw.length < 6) return setErr("Password must be at least 6 characters.");
    if (pw !== pw2) return setErr("Passwords do not match.");
    setBusy("submit");
    setErr("");
    try {
      await api.post("/auth/reset-password", { email, code, newPassword: pw });
      resetFlow("login");
      setInfo("Your password has been changed. Please log in with the new password.");
    } catch (e) {
      setErr(errMsg(e, "Failed to reset the password."));
    } finally {
      setBusy("");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (mode === "login") return doLogin();
    if (mode === "forgot") {
      if (!codeSent) return sendResetCode();
      return doReset();
    }
    // register: route Enter to the current step
    if (!emailVerified) {
      if (codeSent && code.length === 6) return verifyCode();
      if (email) return sendCode();
      return;
    }
    doRegister();
  };

  const title =
    mode === "login" ? "Welcome back" : mode === "register" ? "Get started with PetDate" : "Reset password";
  const subtitle =
    mode === "login"
      ? "Keep matching with fellow pet lovers."
      : mode === "register"
      ? "Verify your email and you're ready to go."
      : "Get a code at your registered email and set a new password.";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden overflow-hidden bg-brand-600 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,#34d399_0%,#059669_45%,#065f46_100%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-xl backdrop-blur">
              🐾
            </span>
            <span className="text-xl font-bold tracking-tight">PetDate</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold leading-tight">
              Find the perfect<br />friend for your pet
            </h1>
            <p className="mt-3 max-w-sm text-white/80">
              Matching, chat, and walk tracking — every moment of pet life in one place.
            </p>
          </div>
          <p className="text-sm text-white/60">© {new Date().getFullYear()} PetDate</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg">🐾</span>
            <span className="text-lg font-bold tracking-tight">PetDate</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

          {mode !== "forgot" && (
            <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => resetFlow("login")}
                className={cx(
                  "rounded-lg py-2 text-sm font-semibold transition",
                  mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                )}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => resetFlow("register")}
                className={cx(
                  "rounded-lg py-2 text-sm font-semibold transition",
                  mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                )}
              >
                Sign up
              </button>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Email" required>
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={mode === "register" && emailVerified}
                />
                {mode === "register" &&
                  (emailVerified ? (
                    <Badge tone="brand" className="h-11 shrink-0 px-3">Verified ✓</Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={sendCode}
                      loading={busy === "send"}
                      disabled={!email}
                      className="shrink-0 whitespace-nowrap"
                    >
                      {codeSent ? "Resend" : "Send code"}
                    </Button>
                  ))}
              </div>
            </Field>

            {mode === "register" && codeSent && !emailVerified && (
              <Field label="Verification code" hint="6-digit code from your email">
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="tracking-[0.4em]"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={verifyCode}
                    loading={busy === "verify"}
                    disabled={code.length !== 6}
                    className="shrink-0"
                  >
                    Verify
                  </Button>
                </div>
              </Field>
            )}

            {mode === "register" && emailVerified && (
              <>
                <Field label="Name" required>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                </Field>
                <Field label="Password" required hint="At least 6 characters">
                  <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
                </Field>
                <Field label="Confirm password" required>
                  <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
                </Field>
              </>
            )}

            {mode === "login" && (
              <Field label="Password" required>
                <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
              </Field>
            )}

            {mode === "forgot" && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={sendResetCode}
                  loading={busy === "send"}
                  disabled={!email}
                  fullWidth
                >
                  {codeSent ? "Resend code" : "Send code"}
                </Button>
                {codeSent && (
                  <>
                    <Field label="Verification code">
                      <Input
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        className="tracking-[0.4em]"
                      />
                    </Field>
                    <Field label="New password" hint="At least 6 characters">
                      <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
                    </Field>
                    <Field label="Confirm new password">
                      <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
                    </Field>
                  </>
                )}
              </>
            )}

            {err && <Banner tone="rose">{err}</Banner>}
            {info && !err && <Banner tone="brand">{info}</Banner>}

            {mode === "login" && (
              <Button type="submit" loading={busy === "submit"} fullWidth size="lg">Log in</Button>
            )}
            {mode === "register" && emailVerified && (
              <Button type="submit" loading={busy === "submit"} fullWidth size="lg">Create account</Button>
            )}
            {mode === "forgot" && codeSent && (
              <Button type="submit" loading={busy === "submit"} fullWidth size="lg">Change password</Button>
            )}
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            {mode === "login" ? (
              <button onClick={() => resetFlow("forgot")} className="text-slate-500 hover:text-slate-800 hover:underline">
                Forgot your password?
              </button>
            ) : (
              <button onClick={() => resetFlow("login")} className="text-slate-500 hover:text-slate-800 hover:underline">
                ← Back to log in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
