"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 회원가입은 /login 페이지의 '회원가입' 탭으로 통합됨
export default function RegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return null;
}
