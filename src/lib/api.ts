// lib/api.ts
import axios from "axios";

function normalizeBase(u: string | undefined) {
  const raw = (u || "").trim();
  if (!raw) return "http://localhost:5050/api";        // 로컬 기본값
  const noTrail = raw.replace(/\/+$/, "");              // 끝 슬래시 제거
  if (/^https?:\/\//i.test(noTrail)) return noTrail;    // 이미 절대 URL
  if (noTrail.startsWith("//")) return "https:" + noTrail;
  return "https://" + noTrail;                          // 스킴 빠졌다면 보정
}

const BASE = normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL);

export const api = axios.create({
  baseURL: BASE,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token && !config.url?.startsWith("/auth/")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 디버그(배포에서 1회만)
if (typeof window !== "undefined") {
  console.log("[API baseURL]", BASE);
}
