"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (loading) return;
    setErr("");
    if (!email || !pw) return setErr("이메일과 비밀번호를 입력해 주세요.");
    if (pw !== pw2) return setErr("비밀번호가 일치하지 않습니다.");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", {
        email,
        password: pw,
        name,
      });
      // 토큰 저장 및 유저 세팅
      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user) setUser(data.user);
      router.replace("/dashboard");
    } catch (e: any) {
      const msg = e?.response?.data?.error || "회원가입에 실패했습니다.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1208px] px-5">
      <div className="mx-auto mt-20 w-full max-w-xl rounded-2xl border border-slate-300 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">회원가입</h1>

        <div className="space-y-4">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            placeholder="이름(선택)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            type="password"
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            placeholder="Password 확인"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            type="password"
          />

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>

          <p className="text-center text-sm text-slate-500">
            이미 계정이 있으신가요?{" "}
            <Link className="underline" href="/login">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
