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
  "문제가 발생했어요.";

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
    if (!email.trim()) return setErr("이메일을 입력해 주세요.");
    if (pw.length < 6) return setErr("비밀번호는 6자 이상이어야 해요.");
    if (pw !== pw2) return setErr("비밀번호가 일치하지 않아요.");
    if (!agreeTerms || !agreePrivacy)
      return setErr("약관과 개인정보처리방침에 동의해 주세요.");
    run(async () => {
      await api.post("/auth/send-code", { email });
      setMsg("인증 코드를 이메일로 보냈어요.");
      setStep("verify");
    });
  };

  const finish = () =>
    run(async () => {
      await api.post("/auth/verify-code", { email, code });
      const name = email.split("@")[0] || "사용자";
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
        <h2 className="mb-5 text-[17px] font-extrabold">계정 만들기</h2>

        {err && <div className="mb-3"><Banner tone="rose">{err}</Banner></div>}
        {msg && !err && <div className="mb-3"><Banner tone="brand">{msg}</Banner></div>}

        {step === "form" ? (
          <div className="flex flex-col gap-4">
            <Field label="이메일">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label="비밀번호" hint="6자 이상">
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </Field>
            <Field label="비밀번호 확인">
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </Field>

            <div className="flex flex-col gap-3 pt-1">
              <div>
                <Switch on={agreeTerms} onChange={setAgreeTerms} label="약관 동의" />
                <p className="mt-1 text-xs" style={{ color: "var(--ink-soft)" }}>
                  PetDate 이용약관에 동의합니다
                </p>
              </div>
              <div>
                <Switch on={agreePrivacy} onChange={setAgreePrivacy} label="개인정보처리방침 동의" />
                <p className="mt-1 text-xs" style={{ color: "var(--ink-soft)" }}>
                  개인정보처리방침에 동의합니다
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <Button variant="secondary" onClick={() => router.push("/login")}>
                취소
              </Button>
              <Button onClick={next} loading={busy}>
                다음
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
              <b style={{ color: "var(--ink)" }}>{email}</b> 로 보낸 인증 코드를 입력해 주세요.
            </p>
            <Field label="인증 코드">
              <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" placeholder="6자리" />
            </Field>
            <Button type="submit" size="lg" fullWidth loading={busy}>
              가입 완료
            </Button>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep("form")}>
                이전
              </Button>
              <Button
                variant="ghost"
                onClick={() => run(async () => {
                  await api.post("/auth/send-code", { email });
                  setMsg("인증 코드를 다시 보냈어요.");
                })}
              >
                코드 재발송
              </Button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm" style={{ color: "var(--ink-soft)" }}>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" style={{ color: "var(--brand-strong)", fontWeight: 700 }}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
