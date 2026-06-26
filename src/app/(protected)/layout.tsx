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
