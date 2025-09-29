"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Pet = { _id: string; name: string };

export default function NewWalkPage() {
  const router = useRouter();

  // form state
  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState("");
  const [distanceKm, setDistanceKm] = useState<number | "">(1.2);
  const [durationMin, setDurationMin] = useState<number | "">(20);
  const [startedAt, setStartedAt] = useState(new Date().toISOString().slice(0, 16)); // yyyy-MM-ddTHH:mm
  const [endedAt, setEndedAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // ✅ 내 펫 불러오기 (실제 ObjectId 사용)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Pet[]>("/pets");
        setPets(data || []);
        if (data?.[0]?._id) setPetId(data[0]._id); // 첫 펫 자동 선택
      } catch (e: any) {
        setMsg(e?.response?.data?.message || "펫 목록 불러오기 실패");
      }
    })();
  }, []);

  // 간단 검증
  const validate = () => {
    if (!petId) return "반려동물을 선택해 주세요.";
    const d = Number(distanceKm);
    const m = Number(durationMin);
    if (isNaN(d) || d <= 0) return "거리는 0보다 커야 합니다.";
    if (isNaN(m) || m <= 0) return "시간(분)은 0보다 커야 합니다.";
    const s = new Date(startedAt);
    const e = new Date(endedAt);
    if (e < s) return "종료 시간이 시작 시간보다 빠를 수 없습니다.";
    return "";
  };

  const submit = async () => {
    const v = validate();
    if (v) {
      setMsg(v);
      return;
    }

    try {
      setLoading(true);
      setMsg("");
      await api.post("/walks", {
        petId, // ✅ 실제 ObjectId
        distanceKm: Number(distanceKm),
        durationMin: Number(durationMin),
        startedAt: new Date(startedAt).toISOString(), // 로컬 → ISO
        endedAt: new Date(endedAt).toISOString(),
        notes,
      });
      setMsg("저장되었습니다! ✅");
      // (선택) 저장 후 이동 또는 초기화
      // router.push("/dashboard");
      // 또는 초기화:
      // setDistanceKm(1.2); setDurationMin(20); setNotes("");
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "저장 중 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[720px] px-5 py-8">
      <h1 className="mb-6 text-2xl font-bold">산책 기록 추가</h1>

      <label className="mb-2 block text-sm font-medium">반려동물</label>
      <select
        className="mb-4 w-full rounded-md border p-2"
        value={petId}
        onChange={(e) => setPetId(e.target.value)}
      >
        {pets.length === 0 && <option value="">펫이 없습니다</option>}
        {pets.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">거리(KM)</label>
          <input
            className="w-full rounded-md border p-2"
            type="number"
            step="0.1"
            min={0}
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">시간(분)</label>
          <input
            className="w-full rounded-md border p-2"
            type="number"
            min={0}
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">시작</label>
          <input
            className="w-full rounded-md border p-2"
            type="datetime-local"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">종료</label>
          <input
            className="w-full rounded-md border p-2"
            type="datetime-local"
            value={endedAt}
            min={startedAt} // UX: 시작 이후만 선택 가능
            onChange={(e) => setEndedAt(e.target.value)}
          />
        </div>
      </div>

      <label className="mt-4 block text-sm font-medium">메모</label>
      <textarea
        className="mb-4 w-full rounded-md border p-2"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />

      <button
        onClick={submit}
        disabled={loading || !petId}
        className="rounded-md bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "저장 중..." : "저장"}
      </button>

      {!!msg && <p className="mt-3 text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
