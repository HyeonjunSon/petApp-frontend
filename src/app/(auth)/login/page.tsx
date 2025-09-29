"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");        // 회원가입용
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");          // 회원가입용 확인
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const handleLogin = async () => {
    const { data } = await api.post("/auth/login", { email, password: pw });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    router.replace("/dashboard");
  };

  const handleRegister = async () => {
    if (!email || !pw) throw new Error("이메일과 비밀번호를 입력해 주세요.");
    if (pw !== pw2) throw new Error("비밀번호가 일치하지 않습니다.");
    const { data } = await api.post("/auth/register", { email, password: pw, name });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    router.replace("/dashboard");
  };

  const onSubmit = async () => {
    if (loading) return;
    setErr("");
    setLoading(true);
    try {
      if (mode === "login") await handleLogin();
      else await handleRegister();
    } catch (e: any) {
      // 서버는 { msg }로 내려보내므로 msg 우선
      const apiMsg = e?.response?.data?.msg || e?.response?.data?.message;
      setErr(apiMsg || e?.message || "처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1208px] px-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="mx-auto mt-16 w-full max-w-xl rounded-2xl border border-slate-300 bg-white p-8 shadow-sm"
      >
        {/* 탭 전환 */}
        <div className="mb-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-xl border px-4 py-2 font-semibold ${
              mode === "login" ? "border-slate-800" : "border-slate-300 text-slate-500"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-xl border px-4 py-2 font-semibold ${
              mode === "register" ? "border-slate-800" : "border-slate-300 text-slate-500"
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 공통 입력 */}
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            required
          />

          {mode === "register" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름(선택)"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            />
          )}

          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            required
          />

          {mode === "register" && (
            <input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              placeholder="Password 확인"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
              required
            />
          )}

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? (mode === "login" ? "로그인 중..." : "가입 중...") : mode === "login" ? "로그인" : "회원가입"}
          </button>

          <p className="text-center text-sm text-slate-500">
            {mode === "login" ? (
              <>
                아직 계정이 없나요?{" "}
                <button type="button" onClick={() => setMode("register")} className="underline">
                  회원가입
                </button>
              </>
            ) : (
              <>
                이미 계정이 있나요?{" "}
                <button type="button" onClick={() => setMode("login")} className="underline">
                  로그인
                </button>
              </>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}
