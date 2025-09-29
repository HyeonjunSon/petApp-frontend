// components/InitAuth.tsx
"use client";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

export default function InitAuth() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || user) return;

    (async () => {
      try {
        const { data } = await api.get("/users/me");
        setUser(data || null);
      } catch {
        setUser(null);
      }
    })();
  }, [user, setUser]);

  return null;
}
