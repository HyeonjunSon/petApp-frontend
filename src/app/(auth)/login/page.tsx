"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Banner } from "@/components/ui";

const apiErr = (e: any) =>
  e?.response?.data?.msg ||
  e?.response?.data?.error ||
  e?.response?.data?.message ||
  e?.message ||
  "Something went wrong. Please try again in a moment.";

const css = `
.au-wrap{display:flex;min-height:100dvh;background:var(--paper);color:var(--ink)}
.au-brand{flex:0 0 44%;min-width:400px;background:var(--ink);color:var(--paper);display:flex;flex-direction:column;justify-content:space-between;padding:56px;position:relative;overflow:hidden}
.au-brand .wordmark{font-family:var(--font-display);font-size:24px;font-weight:700;letter-spacing:-.03em;display:flex;align-items:center;gap:10px}
.au-brand .wordmark .logo-dot{border-color:var(--paper)}
.au-brand h1{font-size:38px}
.au-brand .sub{margin-top:14px;font-size:15px;color:color-mix(in srgb,var(--paper) 72%,transparent);line-height:var(--lh-relaxed)}
.au-feats{margin-top:36px;display:flex;flex-direction:column;gap:18px;list-style:none;padding:0;margin-bottom:0}
.au-feats li{display:flex;align-items:center;gap:14px}
.au-feats .ic{width:44px;height:44px;border-radius:14px;background:color-mix(in srgb,var(--paper) 12%,transparent);display:grid;place-items:center;font-size:20px;flex-shrink:0}
.au-feats .tx b{display:block;font-size:15px;font-weight:600}
.au-feats .tx span{display:block;font-size:14px;color:color-mix(in srgb,var(--paper) 65%,transparent)}
.au-brand .foot{font-size:13px;color:color-mix(in srgb,var(--paper) 55%,transparent)}
.au-brand .bigdot{position:absolute;right:-70px;bottom:-70px;width:240px;height:240px;border-radius:50%;background:var(--ball);opacity:.18;pointer-events:none}
.au-form-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px}
.au-card{width:100%;max-width:400px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-card);padding:32px}
.au-card h2{font-size:22px}
.au-card .hint{margin-top:6px;font-size:14px;color:var(--fence)}
.au-field{margin-top:16px}
.au-field label{display:block;font-size:14px;font-weight:600;margin-bottom:6px}
.au-field input{width:100%;height:46px;border:0;border-radius:var(--radius-input);background:var(--paper);padding:0 14px;font-size:15px;outline:none;color:var(--ink);font-family:inherit}
.au-field input:focus{box-shadow:0 0 0 2px var(--ink)}
.au-field input:disabled{opacity:.6}
.au-field .sub-hint{margin-top:6px;font-size:13px;color:var(--fence)}
.au-pw{position:relative}
.au-pw input{padding-right:56px}
.au-pw button{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:13px;font-weight:700;color:var(--fence);background:none;border:0;cursor:pointer;padding:0}
.au-btn{width:100%;margin-top:20px;height:50px;background:var(--ink);color:var(--paper);font-size:15px;font-weight:600;border-radius:999px;border:0;cursor:pointer;font-family:inherit}
.au-btn:active{transform:scale(.99)}
.au-btn:disabled{opacity:.55;cursor:default}
.au-btn-ghost{width:100%;margin-top:10px;height:46px;background:transparent;color:var(--ink);font-size:15px;font-weight:600;border-radius:999px;border:1px solid var(--line);cursor:pointer;font-family:inherit}
.au-links{margin-top:16px;display:flex;justify-content:space-between;align-items:center;font-size:14px;color:var(--fence)}
.au-links a{font-weight:700;color:var(--ink);text-decoration:underline;text-underline-offset:3px}
.au-links .linklike{font-weight:700;color:var(--ink);background:none;border:0;cursor:pointer;font-size:inherit;font-family:inherit;padding:0;text-decoration:underline;text-underline-offset:3px}
@media(max-width:900px){.au-brand{display:none}}
`;

function BrandPanel() {
  return (
    <aside className="au-brand">
      <div className="wordmark">
        <span className="logo-dot" />
        Offleash
      </div>
      <div>
        <h1>
          Your neighbourhood,
          <br />
          off the leash
        </h1>
        <p className="sub">
          The block&apos;s dogs, walks, and people — one feed
          <br />
          for your neighbourhood pack.
        </p>
        <ul className="au-feats">
          <li>
            <span className="ic">📣</span>
            <span className="tx">
              <b>Neighbourhood feed</b>
              <span>Lost-dog alerts, walk-mate calls, and local tips</span>
            </span>
          </li>
          <li>
            <span className="ic">🐕</span>
            <span className="tx">
              <b>Walk together</b>
              <span>Post a walk, see who&apos;s in, meet at the corner</span>
            </span>
          </li>
          <li>
            <span className="ic">🎾</span>
            <span className="tx">
              <b>Meet the pack</b>
              <span>Every dog within walking distance, sorted by distance</span>
            </span>
          </li>
        </ul>
      </div>
      <p className="foot">© 2026 Offleash · Your neighbourhood, off the leash</p>
      <span className="bigdot" aria-hidden />
    </aside>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("token")) router.replace("/home");
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
      router.replace("/home");
    });

  const doForgotSend = () =>
    run(async () => {
      await api.post("/auth/forgot-password", { email });
      setMsg("We sent a reset code to your email.");
      setForgotStep(2);
    });

  const doReset = () =>
    run(async () => {
      await api.post("/auth/reset-password", { email, code, newPassword: newPw });
      setMsg("Your password has been changed. Please log in again.");
      setMode("login");
      setForgotStep(1);
      setCode("");
      setNewPw("");
      setPw("");
    });

  return (
    <div className="au-wrap">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <BrandPanel />
      <main className="au-form-wrap">
        <div className="au-card">
          {mode === "login" ? (
            <>
              <h2>Welcome back</h2>
              <p className="hint">Log in and see what the block is up to.</p>
            </>
          ) : (
            <>
              <h2>Reset password</h2>
              <p className="hint">We&apos;ll send a reset code to your email.</p>
            </>
          )}

          {err && (
            <div style={{ marginTop: 16 }}>
              <Banner tone="rose">{err}</Banner>
            </div>
          )}
          {msg && !err && (
            <div style={{ marginTop: 16 }}>
              <Banner tone="brand">{msg}</Banner>
            </div>
          )}

          {mode === "login" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!busy) doLogin();
              }}
            >
              <div className="au-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
              <div className="au-field">
                <label htmlFor="login-pw">Password</label>
                <div className="au-pw">
                  <input
                    id="login-pw"
                    type={showPw ? "text" : "password"}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <button type="submit" className="au-btn" disabled={busy}>
                {busy ? "Logging in..." : "Log in"}
              </button>
              <div className="au-links">
                <button
                  type="button"
                  className="linklike"
                  onClick={() => {
                    setMode("forgot");
                    setErr(null);
                    setMsg(null);
                  }}
                >
                  Forgot password?
                </button>
                <span>
                  No account? <Link href="/register">Sign up</Link>
                </span>
              </div>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (busy) return;
                forgotStep === 1 ? doForgotSend() : doReset();
              }}
            >
              <div className="au-field">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={forgotStep === 2}
                />
              </div>
              {forgotStep === 2 && (
                <>
                  <div className="au-field">
                    <label htmlFor="forgot-code">Verification code</label>
                    <input
                      id="forgot-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      inputMode="numeric"
                      placeholder="6-digit code"
                    />
                  </div>
                  <div className="au-field">
                    <label htmlFor="forgot-newpw">New password</label>
                    <input
                      id="forgot-newpw"
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      autoComplete="new-password"
                    />
                    <p className="sub-hint">Use at least 6 characters.</p>
                  </div>
                </>
              )}
              <button type="submit" className="au-btn" disabled={busy}>
                {forgotStep === 1 ? "Send reset code" : "Change password"}
              </button>
              <button
                type="button"
                className="au-btn-ghost"
                onClick={() => {
                  setMode("login");
                  setForgotStep(1);
                  setErr(null);
                  setMsg(null);
                }}
              >
                Back to log in
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
