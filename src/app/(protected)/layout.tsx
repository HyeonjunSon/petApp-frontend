"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import InitAuth from "@/components/InitAuth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [loading, setLoading] = useState(true);
  const didFetch = useRef(false); // dev 모드에서 useEffect 두 번 방지

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    (async () => {
      // 이미 InitAuth가 user를 채워줬다면 추가 호출 불필요
      if (user) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/users/me"); // baseURL=/api
        setUser(data);
      } catch {
        if (path !== "/login") router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [path, router, setUser, user]);

  if (loading) return <div>인증 확인 중...</div>;

  return (
    <>
      {/* 전역 초기화: 토큰이 있고 user가 비어있을 때 /users/me 호출 */}
      <InitAuth />
      {children}
    </>
  );
}
