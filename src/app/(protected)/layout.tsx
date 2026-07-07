"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import TopBar from "@/components/shell/TopBar";
import SideNav from "@/components/shell/SideNav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const didFetch = useRef(false); // prevent double useEffect in dev mode

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    (async () => {
      if (user) {
        setLoading(false);
        return;
      }
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.replace("/login");
        return; // navigating away — keep the loading gate up
      }
      try {
        const { data } = await api.get("/users/me"); // baseURL=/api
        setUser(data);
        setLoading(false);
      } catch {
        // Invalid/expired token or backend unreachable. Clear it so the
        // /login page won't bounce us straight back here — otherwise the
        // two pages redirect to each other forever (infinite reload loop).
        try {
          localStorage.removeItem("token");
        } catch {}
        setUser(null);
        router.replace("/login");
      }
    })();
  }, [path, router, setUser, user]);

  if (loading) {
    return (
      <div
        className="grid min-h-dvh place-items-center text-sm"
        style={{ color: "var(--ink-soft)" }}
      >
        불러오는 중…
      </div>
    );
  }

  return (
    <div
      className="flex h-dvh flex-col"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <TopBar onMenu={() => setDrawer(true)} />
      <div className="flex min-h-0 flex-1">
        <SideNav drawer={drawer} onClose={() => setDrawer(false)} />
        <main className="pd-scroll min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
