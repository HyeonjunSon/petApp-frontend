"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Banner, Switch } from "@/components/ui";

const apiErr = (e: any) =>
  e?.response?.data?.msg ||
  e?.response?.data?.error ||
  e?.response?.data?.message ||
  e?.message ||
  "Something went wrong. Please try again in a moment.";

const RESEND_COOLDOWN = 60; // seconds

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
.au-code-row{display:flex;gap:8px}
.au-code-row .grow{flex:1}
.au-send{flex:none;height:46px;padding:0 14px;border-radius:var(--radius-md);background:var(--primary-10);color:var(--primary);font-size:var(--fs-meta);font-weight:var(--fw-bold);border:0;cursor:pointer;white-space:nowrap;transition:opacity 120ms}
.au-send:active{opacity:.8}
.au-send:disabled{opacity:.5;cursor:default}
.au-pw{position:relative}
.au-pw input{padding-right:56px}
.au-pw button{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:var(--fs-caption);font-weight:var(--fw-bold);color:var(--text-secondary);background:none;border:0;cursor:pointer;padding:0}
.au-agree{margin-top:18px;display:flex;flex-direction:column;gap:12px}
.au-agree .row{display:flex;align-items:center;justify-content:space-between;gap:12px}
.au-agree .lb{font-size:var(--fs-meta);font-weight:var(--fw-semibold)}
.au-agree .lb a{color:var(--primary);font-weight:var(--fw-bold);text-decoration:none}
.au-btn{width:100%;margin-top:20px;height:50px;background:var(--primary);color:var(--white);font-size:var(--fs-body);font-weight:var(--fw-bold);border-radius:var(--radius-lg);border:0;cursor:pointer;transition:opacity 120ms}
.au-btn:active{opacity:.85}
.au-btn:disabled{opacity:.6;cursor:default}
.au-links{margin-top:16px;display:flex;justify-content:center;font-size:var(--fs-meta);color:var(--text-secondary)}
.au-links a{font-weight:var(--fw-bold);color:var(--primary);text-decoration:none}
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

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
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
      setMsg("We sent a verification code to your email.");
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
    if (!sent) return setErr("Please request a verification code by email first.");
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
    <div className="au-wrap">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <BrandPanel />
      <main className="au-form-wrap">
        <div className="au-card">
          <h2>Nice to meet you</h2>
          <p className="hint">Verify your email and you&apos;re ready to go.</p>

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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) submit();
            }}
          >
            <div className="au-field">
              <label htmlFor="reg-email">Email</label>
              <div className="au-code-row">
                <div className="grow">
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="button"
                  className="au-send"
                  onClick={sendCode}
                  disabled={sending || cooldown > 0}
                >
                  {cooldown > 0
                    ? `Resend (${cooldown}s)`
                    : sent
                      ? "Resend code"
                      : "Send code"}
                </button>
              </div>
            </div>

            <div className="au-field">
              <label htmlFor="reg-code">Verification code</label>
              <input
                id="reg-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
              />
              <p className="sub-hint">
                {sent
                  ? `Enter the 6-digit code we sent to ${email}.`
                  : "Press 'Send code' and we'll email you a code."}
              </p>
            </div>

            <div className="au-field">
              <label htmlFor="reg-pw">Password</label>
              <div className="au-pw">
                <input
                  id="reg-pw"
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              <p className="sub-hint">Use at least 6 characters.</p>
            </div>
            <div className="au-field">
              <label htmlFor="reg-pw2">Confirm password</label>
              <input
                id="reg-pw2"
                type={showPw ? "text" : "password"}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </div>

            <div className="au-agree">
              <div className="row">
                <span className="lb">
                  I agree to the <Link href="/terms">Terms of Service</Link> (required)
                </span>
                <Switch on={agreeTerms} onChange={setAgreeTerms} />
              </div>
              <div className="row">
                <span className="lb">
                  I agree to the <Link href="/privacy">Privacy Policy</Link> (required)
                </span>
                <Switch on={agreePrivacy} onChange={setAgreePrivacy} />
              </div>
            </div>

            <button type="submit" className="au-btn" disabled={busy}>
              {busy ? "Signing up..." : "Sign up"}
            </button>
          </form>

          <div className="au-links">
            <span>
              Already have an account?&nbsp;<Link href="/login">Log in</Link>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
