// frontend/app/walks/page.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Pet = { _id: string; name: string; breed?: string };
type Walk = {
  _id: string;
  pet: Pet | string;
  distanceKm: number;
  durationMin: number;
  startedAt: string; // ISO
  endedAt: string;   // ISO
  notes?: string;
};

export default function WalksPage() {
  // 필터 상태
  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState("");
  const [from, setFrom] = useState<string>(() => {
    const d = new Date(); d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10); // yyyy-MM-dd
  });
  const [to, setTo] = useState<string>(() => {
    const d = new Date(); d.setHours(23,59,59,999);
    return d.toISOString().slice(0,10);
  });

  // 데이터
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // 개별 삭제 진행 상태
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // 최초 펫 로드
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Pet[]>("/pets");
        setPets(data || []);
      } catch (e:any) {
        setMsg(e?.response?.data?.message || "펫 목록 불러오기 실패");
      }
    })();
  }, []);

  // 목록 로드
  const load = async () => {
    try {
      setLoading(true);
      setMsg("");
      const params: any = {};
      if (from) params.from = new Date(from + "T00:00:00").toISOString();
      if (to)   params.to   = new Date(to   + "T23:59:59").toISOString();
      if (petId) params.petId = petId;

      const { data } = await api.get<Walk[]>("/walks", { params });
      setWalks(data);
    } catch (e:any) {
      setMsg(e?.response?.data?.message || "산책기록 불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  // 최초 로드
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const grouped = useMemo(() => {
    // 날짜별 그룹 (yyyy-MM-dd)
    const g: Record<string, Walk[]> = {};
    walks.forEach(w => {
      const day = new Date(w.startedAt).toISOString().slice(0,10);
      g[day] = g[day] || [];
      g[day].push(w);
    });
    // 날짜 내림차순
    return Object.entries(g).sort((a,b)=> (a[0] < b[0] ? 1 : -1));
  }, [walks]);

  const totalToday = useMemo(() => {
    const today = new Date().toISOString().slice(0,10);
    const dayList = walks.filter(w => w.startedAt.slice(0,10) === today);
    const cnt = dayList.length;
    const km  = dayList.reduce((a,w)=> a + (w.distanceKm||0), 0);
    const min = dayList.reduce((a,w)=> a + (w.durationMin||0), 0);
    return { cnt, km: +km.toFixed(1), min };
  }, [walks]);

  // 삭제 함수
  const deleteWalk = async (id: string) => {
    const ok = confirm("이 산책 기록을 삭제할까요?");
    if (!ok) return;
    try {
      setMsg("");
      setDeletingIds(prev => new Set(prev).add(id)); // 진행중 표시
      await api.delete(`/walks/${id}`);
      // 성공 시 프론트에서 즉시 제거
      setWalks(prev => prev.filter(w => w._id !== id));
    } catch (e:any) {
      setMsg(e?.response?.data?.message || "삭제에 실패했습니다.");
    } finally {
      setDeletingIds(prev => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }
  };

  return (
    <div className="mx-auto max-w-[980px] px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">산책 기록</h1>
        <Link href="/walks/new" className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:opacity-90">
          + 새 기록
        </Link>
      </div>

      {/* 요약 카드 */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">오늘 산책</div>
          <div className="mt-1 text-2xl font-semibold">{totalToday.cnt}회</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">오늘 거리</div>
          <div className="mt-1 text-2xl font-semibold">{totalToday.km}km</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">오늘 시간</div>
          <div className="mt-1 text-2xl font-semibold">{totalToday.min}분</div>
        </div>
      </div>

      {/* 필터바 */}
      <div className="mb-4 grid grid-cols-12 gap-3 rounded-xl border bg-white p-4">
        <div className="col-span-12 sm:col-span-4">
          <label className="mb-1 block text-xs text-slate-500">반려동물</label>
          <select className="w-full rounded-md border p-2" value={petId} onChange={(e)=>setPetId(e.target.value)}>
            <option value="">전체</option>
            {pets.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div className="col-span-6 sm:col-span-3">
          <label className="mb-1 block text-xs text-slate-500">시작일</label>
          <input className="w-full rounded-md border p-2" type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
        </div>
        <div className="col-span-6 sm:col-span-3">
          <label className="mb-1 block text-xs text-slate-500">종료일</label>
          <input className="w-full rounded-md border p-2" type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
        </div>
        <div className="col-span-12 sm:col-span-2 flex items-end">
          <button onClick={load} className="w-full rounded-md border bg-emerald-600 px-3 py-2 text-white hover:opacity-90">
            조회
          </button>
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-slate-500">불러오는 중…</div>
      ) : grouped.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-slate-500">
          아직 산책 기록이 없습니다. <Link href="/walks/new" className="text-emerald-700 underline">첫 기록을 추가</Link>해 보세요!
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, items]) => (
            <div key={day} className="rounded-xl border bg-white">
              <div className="border-b px-5 py-3 font-semibold">{formatDay(day)}</div>
              <ul className="divide-y">
                {items.map(w => {
                  const isDeleting = deletingIds.has(w._id);
                  return (
                    <li key={w._id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-lg">🐾</div>
                        <div>
                          <div className="font-medium">
                            {typeof w.pet === "string" ? "반려동물" : (w.pet as Pet)?.name} · {w.distanceKm}km · {w.durationMin}분
                          </div>
                          <div className="text-xs text-slate-500">{formatTime(w.startedAt)} ~ {formatTime(w.endedAt)}</div>
                          {w.notes && <div className="mt-1 text-xs text-slate-500">메모: {w.notes}</div>}
                        </div>
                      </div>

                      {/* 수정/삭제 버튼 */}
                      <div className="flex items-center gap-2">
                        {/* <button className="rounded-md border px-3 py-1.5 text-sm">수정</button> */}
                        <button
                          onClick={() => deleteWalk(w._id)}
                          disabled={isDeleting}
                          className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition ${
                            isDeleting
                              ? "cursor-not-allowed opacity-60"
                              : "hover:bg-red-50 hover:text-red-600 border-red-200 text-red-600"
                          }`}
                          aria-label="산책 기록 삭제"
                          title="삭제"
                        >
                          {isDeleting ? "삭제중…" : "🗑️ 삭제"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {!!msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}
    </div>
  );
}

function formatDay(yyyyMMdd: string) {
  const d = new Date(yyyyMMdd + "T00:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", weekday: "short" });
}
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
