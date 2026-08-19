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
.au-wrap{display:flex;min-height:100dvh;background:var(--background);color:var(--text)}
.au-brand{flex:0 0 44%;min-width:400px;background:linear-gradient(150deg,var(--primary) 0%,#6A61C9 100%);color:var(--white);display:flex;flex-direction:column;justify-content:space-between;padding:56px;position:relative;overflow:hidden}
.au-brand .wordmark{font-size:var(--fs-h1);font-weight:var(--fw-extrabold);letter-spacing:var(--ls-snug);display:flex;align-items:center;gap:10px}
.au-brand .pawtile{width:40px;height:40px;border-radius:var(--radius-lg);background:rgba(255,255,255,.18);display:grid;place-items:center;font-size:20px}
.au-brand h1{font-size:34px;font-weight:var(--fw-extrabold);line-height:var(--lh-snug);letter-spacing:var(--ls-tight)}
.au-brand .sub{margin-top:14px;font-size:var(--fs-body);color:rgba(255,255,255,.85);line-height:var(--lh-relaxed)}
.au-feats{margin-top:36px;display:flex;flex-direction:column;gap:18px;list-style:none;padding:0;margin-bottom:0}
.au-feats li{display:flex;align-items:center;gap:14px}
.au-feats .ic{width:44px;height:44px;border-radius:var(--radius-lg);background:rgba(255,255,255,.16);display:grid;place-items:center;font-size:20px;flex-shrink:0}
.au-feats .tx b{display:block;font-size:var(--fs-body);font-weight:var(--fw-bold)}
.au-feats .tx span{display:block;font-size:var(--fs-meta);color:rgba(255,255,255,.75)}
.au-brand .foot{font-size:var(--fs-caption);color:rgba(255,255,255,.6)}
.au-brand .bigpaw{position:absolute;right:-40px;bottom:-40px;font-size:220px;opacity:.1;pointer-events:none;line-height:1}
.au-form-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px}
.au-card{width:100%;max-width:400px;background:var(--surface);border-radius:var(--radius-2xl);box-shadow:var(--shadow-card-strong);padding:32px}
.au-card h2{font-size:var(--fs-h2);font-weight:var(--fw-extrabold);letter-spacing:var(--ls-snug)}
.au-card .hint{margin-top:4px;font-size:var(--fs-meta);color:var(--text-secondary)}
.au-field{margin-top:16px}
.au-field label{display:block;font-size:var(--fs-meta);font-weight:var(--fw-semibold);margin-bottom:6px}
.au-field input{width:100%;height:46px;border:0;border-radius:var(--radius-md);background:var(--input-bg);padding:0 14px;font-size:var(--fs-body);outline:none;color:var(--text)}
.au-field input:focus{box-shadow:0 0 0 2px var(--primary)}
.au-field input:disabled{opacity:.6}
.au-field .sub-hint{margin-top:6px;font-size:var(--fs-caption);color:var(--text-secondary)}
.au-pw{position:relative}
.au-pw input{padding-right:56px}
.au-pw button{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:var(--fs-caption);font-weight:var(--fw-bold);color:var(--text-secondary);background:none;border:0;cursor:pointer;padding:0}
.au-btn{width:100%;margin-top:20px;height:50px;background:var(--primary);color:var(--white);font-size:var(--fs-body);font-weight:var(--fw-bold);border-radius:var(--radius-lg);border:0;cursor:pointer;transition:opacity 120ms}
.au-btn:active{opacity:.85}
.au-btn:disabled{opacity:.6;cursor:default}
.au-btn-ghost{width:100%;margin-top:10px;height:46px;background:var(--input-bg);color:var(--text-secondary);font-size:var(--fs-body-sm);font-weight:var(--fw-bold);border-radius:var(--radius-lg);border:0;cursor:pointer}
.au-links{margin-top:16px;display:flex;justify-content:space-between;align-items:center;font-size:var(--fs-meta);color:var(--text-secondary)}
.au-links a{font-weight:var(--fw-bold);color:var(--primary);text-decoration:none}
.au-links .linklike{font-weight:var(--fw-bold);color:var(--primary);background:none;border:0;cursor:pointer;font-size:inherit;padding:0}
@media(max-width:900px){.au-brand{display:none}}
`;

function BrandPanel() {
  return (
    <aside className="au-brand">
      <div className="wordmark">
        <span className="pawtile">🐾</span>PetDate
      </div>
      <div>
        <h1>
          Find your dog&apos;s
          <br />
          perfect
          <br />
          walking mate
        </h1>
        <p className="sub">
          Meet nearby owners and pets — walk together,
          <br />
          become friends, and maybe more.
        </p>
        <ul className="au-feats">
          <li>
            <span className="ic">💜</span>
            <span className="tx">
              <b>Smart matching</b>
              <span>Discover pets that match your vibe and neighborhood</span>
            </span>
          </li>
          <li>
            <span className="ic">🐕</span>
            <span className="tx">
              <b>Walk together</b>
              <span>Plan meetups and keep a log of your walks</span>
            </span>
          </li>
          <li>
            <span className="ic">🛡️</span>
            <span className="tx">
              <b>Safe meetups</b>
              <span>Verified badges, report and block for peace of mind</span>
            </span>
          </li>
        </ul>
      </div>
      <p className="foot">© 2026 PetDate · Walking mates for your pet</p>
      <span className="bigpaw" aria-hidden>
        🐾
      </span>
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
              <p className="hint">Log in and meet walking mates.</p>
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
