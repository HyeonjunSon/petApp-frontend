"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, Button, Field, Select, Input, Banner, Icon, Badge } from "@/components/ui";

type Pet = { _id: string; name: string; breed?: string };
type Walk = {
  _id: string;
  pet: Pet | string;
  distanceKm: number;
  durationMin: number;
  startedAt: string;
  endedAt: string;
  notes?: string;
};

export default function WalksPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState("");
  const [from, setFrom] = useState<string>(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState<string>(() => {
    const d = new Date(); d.setHours(23, 59, 59, 999);
    return d.toISOString().slice(0, 10);
  });

  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  type WalkInvite = {
    _id: string; date: string; time: string; place?: string; note?: string;
    status: "proposed" | "confirmed" | "declined" | "cancelled";
  };
  const [upcoming, setUpcoming] = useState<WalkInvite[]>([]);

  useEffect(() => {
    api
      .get<WalkInvite[]>("/walk-invites", { params: { scope: "upcoming" } })
      .then(({ data }) => {
        const sorted = (data || [])
          .filter((i) => i.status === "confirmed")
          .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
        setUpcoming(sorted);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Pet[]>("/pets");
        setPets(data || []);
      } catch (e: any) {
        setMsg(e?.response?.data?.message || "Failed to load pets");
      }
    })();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setMsg("");
      const params: any = {};
      if (from) params.from = new Date(from + "T00:00:00").toISOString();
      if (to) params.to = new Date(to + "T23:59:59").toISOString();
      if (petId) params.petId = petId;
      const { data } = await api.get<Walk[]>("/walks", { params });
      setWalks(data);
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Failed to load walks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const grouped = useMemo(() => {
    const g: Record<string, Walk[]> = {};
    walks.forEach((w) => {
      const day = new Date(w.startedAt).toISOString().slice(0, 10);
      (g[day] = g[day] || []).push(w);
    });
    return Object.entries(g).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [walks]);

  const totalToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const dayList = walks.filter((w) => w.startedAt.slice(0, 10) === today);
    return {
      cnt: dayList.length,
      km: +dayList.reduce((a, w) => a + (w.distanceKm || 0), 0).toFixed(1),
      min: dayList.reduce((a, w) => a + (w.durationMin || 0), 0),
    };
  }, [walks]);

  const deleteWalk = async (id: string) => {
    if (!confirm("Delete this walk record?")) return;
    try {
      setMsg("");
      setDeletingIds((prev) => new Set(prev).add(id));
      await api.delete(`/walks/${id}`);
      setWalks((prev) => prev.filter((w) => w._id !== id));
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Failed to delete.");
    } finally {
      setDeletingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  return (
    <div className="mx-auto max-w-[980px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Walks</h1>
          <p className="mt-1 text-sm text-slate-500">Track walks with your pet.</p>
        </div>
        <Link href="/walks/new"><Button size="sm">+ New walk</Button></Link>
      </div>

      {upcoming.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: "var(--ink-soft)" }}>Upcoming walks</h2>
            <span className="text-xs" style={{ color: "var(--ink-faint)" }}>{upcoming.length}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {upcoming.map((u) => (
              <div
                key={u._id}
                className="surface flex shrink-0 flex-col gap-1 rounded-2xl p-4"
                style={{ minWidth: 220 }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-lg"
                    style={{ background: "var(--brand)", color: "#fff" }}
                  >
                    <Icon name="walk" size={16} />
                  </span>
                  <Badge tone="brand">Confirmed</Badge>
                </div>
                <div className="mt-1 text-sm font-bold" style={{ color: "var(--ink)" }}>
                  {u.date} · {u.time}
                </div>
                {u.place && (
                  <div className="text-xs" style={{ color: "var(--ink-soft)" }}>
                    📍 {u.place}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card><div className="text-xs text-slate-500">Walks today</div><div className="mt-1 text-2xl font-bold">{totalToday.cnt}</div></Card>
        <Card><div className="text-xs text-slate-500">Distance today</div><div className="mt-1 text-2xl font-bold">{totalToday.km}km</div></Card>
        <Card><div className="text-xs text-slate-500">Time today</div><div className="mt-1 text-2xl font-bold">{totalToday.min}min</div></Card>
      </div>

      <Card>
        <div className="grid grid-cols-12 items-end gap-3">
          <Field label="Pet" className="col-span-12 sm:col-span-4">
            <Select value={petId} onChange={(e) => setPetId(e.target.value)}>
              <option value="">All</option>
              {pets.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="From" className="col-span-6 sm:col-span-3">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To" className="col-span-6 sm:col-span-3">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <div className="col-span-12 sm:col-span-2">
            <Button onClick={load} fullWidth loading={loading}>Search</Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card><div className="text-sm text-slate-500">Loading…</div></Card>
      ) : grouped.length === 0 ? (
        <Card>
          <div className="text-sm text-slate-500">
            No walks yet. <Link href="/walks/new" className="text-brand-700 underline">Add your first record</Link>!
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, items]) => (
            <Card key={day} padded={false}>
              <div className="border-b border-slate-100 px-5 py-3 font-semibold">{formatDay(day)}</div>
              <ul className="divide-y divide-slate-100">
                {items.map((w) => {
                  const isDeleting = deletingIds.has(w._id);
                  return (
                    <li key={w._id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-lg">🐾</span>
                        <div>
                          <div className="font-medium text-slate-900">
                            {typeof w.pet === "string" ? "Pet" : (w.pet as Pet)?.name} · {w.distanceKm}km · {w.durationMin}min
                          </div>
                          <div className="text-xs text-slate-500">{formatTime(w.startedAt)} ~ {formatTime(w.endedAt)}</div>
                          {w.notes && <div className="mt-1 text-xs text-slate-500">Note: {w.notes}</div>}
                        </div>
                      </div>
                      <Button variant="danger" size="sm" onClick={() => deleteWalk(w._id)} disabled={isDeleting}>
                        {isDeleting ? "Deleting…" : "Delete"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}
        </div>
      )}

      {!!msg && <Banner tone="rose">{msg}</Banner>}
    </div>
  );
}

function formatDay(yyyyMMdd: string) {
  const d = new Date(yyyyMMdd + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
}
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
