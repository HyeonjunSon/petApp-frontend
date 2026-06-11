"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import InitAuth from "@/components/InitAuth";
import AppSidebar from "@/components/AppSidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [loading, setLoading] = useState(true);
  const didFetch = useRef(false); // prevent double useEffect in dev mode

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    (async () => {
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

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-slate-50">
      <InitAuth />
      <AppSidebar />
      <main className="pd-scroll min-w-0 flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
