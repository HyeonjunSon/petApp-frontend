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
  "문제가 발생했어요. 잠시 후 다시 시도해 주세요.";

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
          우리 강아지의
          <br />
          산책 친구를
          <br />
          찾아보세요
        </h1>
        <p className="sub">
          가까운 동네 보호자와 펫을 만나 같이 걷고,
          <br />
          친구가 되고, 데이트까지 이어져요.
        </p>
        <ul className="au-feats">
          <li>
            <span className="ic">💜</span>
            <span className="tx">
              <b>취향 매칭</b>
              <span>취향과 동네가 맞는 펫을 발견해요</span>
            </span>
          </li>
          <li>
            <span className="ic">🐕</span>
            <span className="tx">
              <b>같이 산책하기</b>
              <span>약속을 잡고 산책 기록을 남겨요</span>
            </span>
          </li>
          <li>
            <span className="ic">🛡️</span>
            <span className="tx">
              <b>안전한 만남</b>
              <span>인증 배지 · 신고 · 차단으로 안심해요</span>
            </span>
          </li>
        </ul>
      </div>
      <p className="foot">© 2026 PetDate · 반려동물 산책 메이트</p>
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
    if (!email.trim()) return setErr("이메일을 먼저 입력해 주세요.");
    setSending(true);
    try {
      await api.post("/auth/send-code", { email });
      setSent(true);
      startCooldown();
      setMsg("인증 코드를 이메일로 보내드렸어요.");
    } catch (e) {
      setErr(apiErr(e));
    } finally {
      setSending(false);
    }
  };

  const submit = async () => {
    setErr(null);
    setMsg(null);
    if (!email.trim()) return setErr("이메일을 입력해 주세요.");
    if (!sent) return setErr("이메일로 인증 코드를 먼저 받아 주세요.");
    if (!/^\d{6}$/.test(code.trim()))
      return setErr("6자리 인증 코드를 입력해 주세요.");
    if (pw.length < 6) return setErr("비밀번호는 6자 이상이어야 해요.");
    if (pw !== pw2) return setErr("비밀번호가 서로 달라요.");
    if (!agreeTerms || !agreePrivacy)
      return setErr("이용약관과 개인정보처리방침에 동의해 주세요.");

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
          <h2>만나서 반가워요</h2>
          <p className="hint">이메일 인증만 하면 바로 시작할 수 있어요.</p>

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
              <label htmlFor="reg-email">이메일</label>
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
                    ? `재전송 (${cooldown}초)`
                    : sent
                      ? "코드 재전송"
                      : "인증 코드 받기"}
                </button>
              </div>
            </div>

            <div className="au-field">
              <label htmlFor="reg-code">인증 코드</label>
              <input
                id="reg-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="6자리 코드"
              />
              <p className="sub-hint">
                {sent
                  ? `${email}로 보낸 6자리 코드를 입력해 주세요.`
                  : "‘인증 코드 받기’를 누르면 이메일로 코드를 보내드려요."}
              </p>
            </div>

            <div className="au-field">
              <label htmlFor="reg-pw">비밀번호</label>
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
                  {showPw ? "숨김" : "표시"}
                </button>
              </div>
              <p className="sub-hint">6자 이상 입력해 주세요.</p>
            </div>
            <div className="au-field">
              <label htmlFor="reg-pw2">비밀번호 확인</label>
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
                  <Link href="/terms">이용약관</Link>에 동의해요 (필수)
                </span>
                <Switch on={agreeTerms} onChange={setAgreeTerms} />
              </div>
              <div className="row">
                <span className="lb">
                  <Link href="/privacy">개인정보처리방침</Link>에 동의해요 (필수)
                </span>
                <Switch on={agreePrivacy} onChange={setAgreePrivacy} />
              </div>
            </div>

            <button type="submit" className="au-btn" disabled={busy}>
              {busy ? "가입하는 중..." : "가입하기"}
            </button>
          </form>

          <div className="au-links">
            <span>
              이미 계정이 있나요?&nbsp;<Link href="/login">로그인</Link>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
