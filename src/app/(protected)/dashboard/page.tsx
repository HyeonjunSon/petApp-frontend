"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

type Walk = {
  distanceKm: number;
  durationMin: number;
  startedAt: string;
};

// Common card style classes
const card =
  "rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden";
const cardPadded = `${card} p-5`;

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  // Authentication state
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // Logout handler
  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api.post("/auth/logout").catch(() => {});
    } finally {
      if (typeof window !== "undefined") localStorage.removeItem("token");
      setUser(null);
      setLoggingOut(false);
      router.replace("/login");
    }
  };

  const [walkCount, setWalkCount] = useState<number>(0);
  const [sumKm, setSumKm] = useState<number>(0);
  const [sumMin, setSumMin] = useState<number>(0);

  const [totalWalks, setTotalWalks] = useState<number>(0);
  const [totalKm, setTotalKm] = useState<number>(0);
  const [loadingWalks, setLoadingWalks] = useState<boolean>(true);

  // 1) Auth check -> if success, set user state
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // If no token, redirect to login immediately
        if (typeof window !== "undefined" && !localStorage.getItem("token")) {
          router.replace("/login");
          return;
        }

        const me = await api.get("/users/me");
        if (!alive) return;

        // Consider success if server returns at least _id
        if (!me?.data?._id) throw new Error("Invalid user payload");
        setUser(me.data);
        setAuthChecked(true);
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 401) {
          router.replace("/login");
        } else {
          setAuthError("Failed to load user info.");
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [router, setUser]);

  // 2) After auth confirmed, fetch walk aggregates
  useEffect(() => {
    if (!authChecked) return;
    let alive = true;
    (async () => {
      setLoadingWalks(true);
      try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        //✅ Fetch today + lifetime in parallel
        const [todayRes, allRes] = await Promise.all([
          api.get<Walk[]>("/walks", {
            params: { from: start.toISOString(), to: end.toISOString() },
          }),
          api.get<Walk[]>("/walks"),
        ]);
        if (!alive) return;

        // Today
        const today = todayRes.data;
        const todayKm = today.reduce((a, w) => a + (w.distanceKm || 0), 0);
        const todayMin = today.reduce((a, w) => a + (w.durationMin || 0), 0);
        setWalkCount(today.length);
        setSumKm(Number(todayKm.toFixed(1)));
        setSumMin(todayMin);

        // LifeTime
        const all = allRes.data;
        const allKm = all.reduce((a, w) => a + (w.distanceKm || 0), 0);
        setTotalWalks(all.length);
        setTotalKm(Number(allKm.toFixed(1)));
      } catch {
        setWalkCount(0);
        setSumKm(0);
        setSumMin(0);
        setTotalWalks(0);
        setTotalKm(0);
      } finally {
        if (alive) setLoadingWalks(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [authChecked]);

  type PetDoc = {
    _id: string;
    name: string;
    type: string;
    age?: number;
    bio?: string;
  };

  type Match = {
    _id: string;
    users: { _id: string; name?: string }[];
    lastMessage?: { text?: string; createdAt?: string; from?: string };
    unreadCount?: number;
  };

  const [unreadTotal, setUnreadTotal] = useState<number>(0);
  const [loadingMsgs, setLoadingMsgs] = useState<boolean>(true);

  // Fetch total unread messages from matches
  useEffect(() => {
    if (!authChecked) return;
    let alive = true;

    (async () => {
      setLoadingMsgs(true);
      try {
        const { data } = await api.get<Match[]>("/matches");

        // Assume server returns match.unreadCount; otherwise use a simple fallback.
        const total = data.reduce((acc, m) => {
          if (typeof m.unreadCount === "number") return acc + m.unreadCount;

          // fallback: if the last message is not from me, count it as 1
          if (
            m.lastMessage &&
            m.lastMessage.from &&
            m.lastMessage.from !== user?._id
          )
            return acc + 1;
          return acc;
        }, 0);

        if (!alive) return;
        setUnreadTotal(total);
      } catch {
        if (!alive) return;
        setUnreadTotal(0);
      } finally {
        if (alive) setLoadingMsgs(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [authChecked, user?._id]);

  const [pets, setPets] = useState<PetDoc[]>([]);
  const [loading, setLoading] = useState(true);

  //Load my pets (server filters by owner=req.user._id)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<PetDoc[]>("/pets");
        setPets(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // HERO Top KPIs
  const heroKpis = useMemo(
    () => [
      { label: "Today's Walks", v: loadingWalks ? "—" : `${walkCount}회` },
      { label: "Unread Message", v: loadingMsgs ? "—" : `${unreadTotal}` },
    ],
    [loadingWalks, walkCount, loadingMsgs, unreadTotal]
  );

  const mainKpis = useMemo(
    () => [
      {
        label: "All Walk Records",
        v1: loadingWalks ? "—" : `${totalWalks}회`,
        v2: loadingWalks ? "Aggregating.." : `총 ${totalKm}km`,
      },
      {
        label: "Unread Messages",
        v1: loadingMsgs ? "—" : `${unreadTotal}`,
        v2: "Conversations with unread",
      },
      { label: "Profile", v1: "80%", v2: "comletion" },
    ],
    [loadingWalks, totalWalks, totalKm, loadingMsgs, unreadTotal]
  );

  // Auth loading / error screens
  if (!authChecked && !authError) {
    return (
      <div className="min-h-dvh grid place-items-center text-slate-700">
        <div className="text-sm">Checking authentication…</div>
      </div>
    );
  }
  if (authError) {
    return (
      <div className="min-h-dvh grid place-items-center text-slate-700">
        <div className="rounded-xl border p-5">
          <div className="font-semibold mb-1">Something went wrong</div>
          <div className="text-sm text-slate-500">{authError}</div>
          <button
            onClick={() => router.replace("/login")}
            className="mt-4 rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-slate-50">
        <div className="mx-auto max-w-[1208px] px-5">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl"></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                Hello,{" "}
                <b className="text-slate-800">{user?.name || "User"}</b> 👋
              </span>
              <button
                onClick={onLogout}
                disabled={loggingOut}
                aria-label="Logout"
                className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition disabled:opacity-60"
                title="Logout"
              >
                {loggingOut ? "Logging out…" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative w-full bg-slate-50">
        <div className="mx-auto max-w-[1208px] px-5 py-6">
          <div className={`${card} p-5`}>
            <div className="grid grid-cols-12 gap-6">
              {/* Left Banner */}
              <div className="col-span-12 lg:col-span-7">
                <div className="rounded-xl ring-1 ring-emerald-100 bg-emerald-50/60 p-6">
                  <h1 className="text-[28px] font-extrabold tracking-tight">
                    Welcome to Pet Date
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    See everything at a glance: Walks / Messages / Schedule
                  </p>

                  {/* Mini KPIs */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {heroKpis.map((k) => (
                      <div key={k.label} className={`${card} p-4 text-center`}>
                        <div className="text-xs text-slate-500">{k.label}</div>
                        <div className="mt-1 text-2xl font-semibold">{k.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right quick links 3x2 */}
              <div className="col-span-12 lg:col-span-5">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { t: "My Pets", href: "/pets" },
                    { t: "Chat", href: "/chat" },
                    { t: "Walk Logs", href: "/walks" },
                    { t: "Add Walk", href: "/walks/new" },
                    { t: "Photo Upload", href: "/photos" },
                    { t: "Settings", href: "/settings" },
                  ].map((m) => (
                    <Link
                      key={m.t}
                      href={m.href}
                      className={`${card} p-4 group flex flex-col items-center gap-2 text-center text-sm transition hover:-translate-y-0.5`}
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-2xl">
                        🐾
                      </div>
                      <span className="text-slate-700 group-hover:text-emerald-700">
                        {m.t}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="w-full bg-slate-50">
        <div className="mx-auto max-w-[1208px] px-5 py-6">
          <div className={`${card} p-5`}>
            {/* KPIs */}
            <section className="grid grid-cols-12 gap-6">
              {mainKpis.map((k) => (
                <div
                  key={k.label}
                  className={`col-span-12 sm:col-span-6 xl:col-span-3 ${cardPadded}`}
                >
                  <div className="text-xs text-slate-500">{k.label}</div>
                  <div className="mt-1 text-3xl font-semibold">{k.v1}</div>
                  <div className="mt-1 text-xs text-slate-500">{k.v2}</div>
                </div>
              ))}
            </section>

            {/*  My Pets + Quick Actions */}
            <section className="mt-6 grid grid-cols-12 gap-6">
              {/* My pets */}
              <div className={`col-span-12 2xl:col-span-6 ${card}`}>
                <div className="px-5 py-3 font-semibold border-b border-slate-200">
                  My Pets
                </div>

                {loading ? (
                  <div className="px-5 py-6 text-sm text-slate-500">
                    Loading..
                  </div>
                ) : pets.length === 0 ? (
                  <div className="px-5 py-6 text-sm text-slate-500">
                    No pets registered
                  </div>
                ) : (
                  <ul className="m-0 list-none divide-y divide-slate-200">
                    {pets.map((p) => {
                      const sub = `${p.type ?? "Other"} · ${
                        p.age != null ? `${p.age}yrs` : "Age unknown"
                      }`;
                      return (
                        <li
                          key={p._id}
                          className="flex items-center justify-between px-5 py-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              {p.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-slate-500">
                                {sub}
                              </div>
                            </div>
                          </div>
                          <Link href={`/pets?selected=${p._id}`}>Profile</Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* 퀵 액션 1 */}
              <div
                className={`col-span-12 sm:col-span-6 xl:col-span-3 ${cardPadded}`}
              >
                <div className="mb-3 h-10 w-10 rounded-lg bg-indigo-50" />
                <div className="mb-1 font-semibold">산책 기록 추가</div>
                <div className="mb-3 text-sm text-slate-500">
                  거리·시간을 기록해요
                </div>
                <Link
                  href="/walks/new"
                  className="inline-flex rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  기록하기
                </Link>
              </div>

              {/* 퀵 액션 2 */}
              <div
                className={`col-span-12 sm:col-span-6 xl:col-span-3 ${cardPadded}`}
              >
                <div className="mb-3 h-10 w-10 rounded-lg bg-indigo-50" />
                <div className="mb-1 font-semibold">사진 업로드</div>
                <div className="mb-3 text-sm text-slate-500">
                  귀여운 순간 저장
                </div>
                <Link
                  href="/photos"
                  className="inline-flex rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  업로드
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
