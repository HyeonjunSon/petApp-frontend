"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

type Mode = "login" | "register";

/**
 * AuthPage - Login and registration page
 * - Shows a hero image above the form
 */
export default function AuthPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE = "https://res.cloudinary.com/dsedtbco3/image/upload";
  const PUBLIC_ID =
    process.env.NEXT_PUBLIC_LOGIN_HERO_ID || "download_oszuzq.jpg";

  const src1x = `${BASE}/q_100,dpr_1.0/${PUBLIC_ID}`;
  const src15x = `${BASE}/q_100,dpr_1.5/${PUBLIC_ID}`;
  const src2x = `${BASE}/q_100,dpr_2.0/${PUBLIC_ID}`;
  const src3x = `${BASE}/q_100,dpr_3.0/${PUBLIC_ID}`;
  // Redirect if already logged in
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
    if (!email || !pw) throw new Error("Please enter email and password.");
    if (pw !== pw2) throw new Error("Passwords do not match.");
    const { data } = await api.post("/auth/register", {
      email,
      password: pw,
      name,
    });
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
      const apiMsg = e?.response?.data?.msg || e?.response?.data?.message;
      setErr(apiMsg || e?.message || "An error occurred during processing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1208px] px-5">
      {/* Hero image above the card */}
      <div className="mx-auto mt-10 mb-4 w-full max-w-xl">
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <img
            src={src1x}
            srcSet={`${src1x} 1x, ${src15x} 1.5x, ${src2x} 2x, ${src3x} 3x`}
            sizes="(min-width: 768px) 576px, 100vw" // 컨테이너가 max 576px이라면 이렇게
            alt="Dog and cat hero"
            className="h-56 w-full object-cover md:h-64"
            loading="lazy"
          />
        </div>
      </div>

      {/* Auth card */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="mx-auto mt-4 w-full max-w-xl rounded-2xl border border-slate-300 bg-white p-8 shadow-sm"
      >
        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-xl border px-4 py-2 font-semibold ${
              mode === "login"
                ? "border-slate-800"
                : "border-slate-300 text-slate-500"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-xl border px-4 py-2 font-semibold ${
              mode === "register"
                ? "border-slate-800"
                : "border-slate-300 text-slate-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Inputs */}
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
              placeholder="Name (optional)"
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
              placeholder="Confirm Password"
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
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Signing up..."
              : mode === "login"
              ? "Login"
              : "Sign Up"}
          </button>

          <p className="text-center text-sm text-slate-500">
            {mode === "login" ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="underline"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="underline"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}
