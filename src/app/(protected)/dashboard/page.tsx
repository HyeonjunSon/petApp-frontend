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

const card =
  "rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden";

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");

  const [sumKm, setSumKm] = useState<number>(0);
  const [, setSumMin] = useState<number>(0);
  const [, setWalkCount] = useState<number>(0);

  const [totalKm, setTotalKm] = useState<number>(0);
  const [, setTotalWalks] = useState<number>(0);
  const [loadingWalks, setLoadingWalks] = useState<boolean>(true);

  // 1) Auth check
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (typeof window !== "undefined" && !localStorage.getItem("token")) {
          router.replace("/login");
          return;
        }
        const me = await api.get("/users/me");
        if (!alive) return;
        if (!me?.data?._id) throw new Error("Invalid user payload");
        setUser(me.data);
        setAuthChecked(true);
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 401) router.replace("/login");
        else setAuthError("Couldn't load user info.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [router, setUser]);

  // 2) Walk aggregates
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

        const [todayRes, allRes] = await Promise.all([
          api.get<Walk[]>("/walks", {
            params: { from: start.toISOString(), to: end.toISOString() },
          }),
          api.get<Walk[]>("/walks"),
        ]);
        if (!alive) return;

        const today = todayRes.data;
        const todayKm = today.reduce((a, w) => a + (w.distanceKm || 0), 0);
        const todayMin = today.reduce((a, w) => a + (w.durationMin || 0), 0);
        setWalkCount(today.length);
        setSumKm(Number(todayKm.toFixed(1)));
        setSumMin(todayMin);

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

  // Unread messages
  useEffect(() => {
    if (!authChecked) return;
    let alive = true;
    (async () => {
      setLoadingMsgs(true);
      try {
        const { data } = await api.get<Match[]>("/matches");
        const total = data.reduce((acc, m) => {
          if (typeof m.unreadCount === "number") return acc + m.unreadCount;
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

  // My pets
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

  // Profile completion
  const completion = useMemo(() => {
    if (!user) return 0;
    const checks = [
      !!user.heroUrl || !!(user.photos && user.photos.length),
      !!user.about,
      !!user.goal,
      !!(user.interests && user.interests.length),
      pets.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [user, pets.length]);

  const kpis = [
    {
      emoji: "🐾",
      v: loadingWalks ? "—" : sumKm,
      unit: "km",
      label: "Today's walks",
    },
    {
      emoji: "🗺",
      v: loadingWalks ? "—" : totalKm,
      unit: "km",
      label: "Total distance",
    },
    {
      emoji: "💬",
      v: loadingMsgs ? "—" : unreadTotal,
      unit: "",
      label: "Unread messages",
    },
  ];

  const quick = [
    { emoji: "🐾", label: "Start matching", sub: "Find new friends", href: "/match" },
    { emoji: "💬", label: "Chat", sub: "Continue chatting", href: "/chat" },
    { emoji: "📷", label: "Upload photos", sub: "Save memories", href: "/photos" },
    { emoji: "🐶", label: "My pets", sub: "Manage profile", href: "/pets" },
    { emoji: "⚙️", label: "Settings", sub: "Matching · Alerts", href: "/settings" },
  ];

  if (!authChecked && !authError) {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-slate-500">
        Checking authentication…
      </div>
    );
  }
  if (authError) {
    return (
      <div className="grid min-h-dvh place-items-center text-slate-700">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-1 font-semibold">Something went wrong</div>
          <div className="text-sm text-slate-500">{authError}</div>
          <button
            onClick={() => router.replace("/login")}
            className="mt-4 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 py-7">
      {/* greeting hero */}
      <section
        className="rounded-2xl p-7 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
        }}
      >
        <h1 className="text-[26px] font-extrabold">
          Hello, {user?.name || "User"} 👋
        </h1>
        <p className="mt-1.5 text-[15px] text-emerald-50/90">
          Have a happy day with your pet.
        </p>

        {/* profile completion */}
        <div className="mt-5 max-w-md">
          <div className="mb-1.5 flex items-center justify-between text-[13px] font-semibold text-emerald-50/90">
            <span>Profile completion</span>
            <span>{completion}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section className="mt-5 grid grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`${card} p-4 text-center`}>
            <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-[10px] bg-emerald-50 text-lg">
              {k.emoji}
            </div>
            <div className="text-2xl font-extrabold">
              {k.v}
              {k.unit && (
                <span className="ml-0.5 text-xs font-semibold text-slate-400">
                  {k.unit}
                </span>
              )}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </section>

      {/* quick actions */}
      <h2 className="mb-3 mt-7 text-base font-bold">Quick actions</h2>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {quick.map((q) => (
          <Link
            key={q.label}
            href={q.href}
            className={`${card} group flex flex-col items-center gap-2 px-3 py-5 text-center transition hover:-translate-y-0.5`}
          >
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-2xl">
              {q.emoji}
            </div>
            <div className="whitespace-nowrap text-sm font-bold">{q.label}</div>
            <div className="whitespace-nowrap text-xs text-slate-400">
              {q.sub}
            </div>
          </Link>
        ))}
      </section>

      {/* my pets */}
      <div className="mb-3 mt-7 flex items-center justify-between">
        <h2 className="text-base font-bold">My pets</h2>
        <Link href="/pets" className="text-sm font-semibold text-emerald-700">
          View all ›
        </Link>
      </div>
      <section className={card}>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            Loading…
          </div>
        ) : pets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-4xl">
              🐾
            </div>
            <div className="mt-1 font-bold">No pets yet</div>
            <div className="max-w-xs text-sm text-slate-500">
              Register your pet to start matching.
            </div>
            <Link
              href="/pets"
              className="mt-3 inline-flex h-10 items-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Add a pet
            </Link>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-0 sm:grid-cols-3 lg:grid-cols-4">
            {pets.map((p) => {
              const sub = `${p.type ?? "Other"} · ${
                p.age != null ? `${p.age}y` : "Age unknown"
              }`;
              return (
                <li key={p._id} className="border-b border-slate-100 p-3">
                  <Link
                    href={`/pets?selected=${p._id}`}
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-600 text-base font-bold text-white">
                      {p.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{p.name}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {sub}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
