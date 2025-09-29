// lib/api.ts
import axios from "axios";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5050/api"; // 로컬 개발용

export const api = axios.create({
  baseURL: BASE.replace(/\/+$/, ""), // 끝 슬래시 제거해 이중 // 방지
  withCredentials: false,             // 토큰/쿠키 쓰면 유지, 아니면 빼도 OK
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token && !config.url?.startsWith("/auth/")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
