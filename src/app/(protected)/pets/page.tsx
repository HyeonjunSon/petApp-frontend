"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Pet } from "@/types/pet";

type Species = "dog" | "cat" | "other";
type Sex = "male" | "female" | "unknown";
type Size = "s" | "m" | "l";

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [sex, setSex] = useState<Sex>("unknown");
  const [size, setSize] = useState<Size>("m");
  const [temperament, setTemperament] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const temperOptions = useMemo(
    () => ["친화적", "활발함", "차분함", "사교적", "훈련중", "산책러버", "장난꾸러기", "고양이친화", "강아지친화"],
    []
  );

  const load = async () => {
    const { data } = await api.get("/pets");
    setPets(data);
  };
  useEffect(() => { load(); }, []);

  const toggleTemper = (t: string) => {
    setTemperament(prev => {
      if (prev.includes(t)) return prev.filter(x => x !== t);
      if (prev.length >= 5) return prev;
      return [...prev, t];
    });
  };

  const create = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post("/pets", {
        name: name.trim(),
        about: about.trim(),
        species,
        breed: breed.trim() || undefined,
        age: typeof age === "number" ? age : undefined,
        sex,
        size,
        temperament,
      });
      setName(""); setAbout(""); setBreed(""); setAge("");
      setSex("unknown"); setSize("m"); setSpecies("dog"); setTemperament([]);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const appendSparkle = async (p: any) => {
    const about2 = (p.about || "") + " ✨";
    await api.put(`/pets/${p._id}`, { about: about2 });
    await load();
  };

  const remove = async (p: any) => {
    await api.delete(`/pets/${p._id}`);
    await load();
  };

  const upload = async (petId: string, file?: File) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("photo", file);
    fd.append("type", "pet");
    await api.post(`/pets/${petId}/photo`, fd);
    await load();
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">내 펫</h1>
          <p className="mt-1 text-sm text-slate-600">매칭에 필요한 최소 정보만 빠르게 등록하세요.</p>
        </div>
        <a
          href="#"
          className="hidden rounded-lg border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 md:inline-flex"
        >
          가이드
        </a>
      </div>

      {/* 등록 폼 */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4">
            <Label>이름</Label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              placeholder="예: Mango"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="col-span-6 md:col-span-4">
            <Label>종</Label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              value={species}
              onChange={(e) => setSpecies(e.target.value as Species)}
            >
              <option value="dog">강아지</option>
              <option value="cat">고양이</option>
              <option value="other">기타</option>
            </select>
          </div>

          <div className="col-span-6 md:col-span-4">
            <Label>품종</Label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              placeholder="예: Ragdoll / Shiba"
              value={breed}
              maxLength={32}
              onChange={(e) => setBreed(e.target.value)}
            />
          </div>

          <div className="col-span-6 md:col-span-3">
            <Label>나이(년)</Label>
            <input
              type="number"
              min={0}
              max={30}
              step="1"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              placeholder="예: 2"
              value={age}
              onChange={(e) =>
                setAge(e.target.value === "" ? "" : Math.max(0, Math.min(30, Number(e.target.value))))
              }
            />
          </div>

          <div className="col-span-6 md:col-span-3">
            <Label>성별</Label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              value={sex}
              onChange={(e) => setSex(e.target.value as Sex)}
            >
              <option value="male">수컷</option>
              <option value="female">암컷</option>
              <option value="unknown">모름</option>
            </select>
          </div>

          <div className="col-span-6 md:col-span-3">
            <Label>크기</Label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              value={size}
              onChange={(e) => setSize(e.target.value as Size)}
            >
              <option value="s">소형</option>
              <option value="m">중형</option>
              <option value="l">대형</option>
            </select>
          </div>

          <div className="col-span-12 md:col-span-9">
            <Label>한줄소개</Label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              placeholder="예: 사람/강아지 모두 좋아하는 산책러버"
              value={about}
              maxLength={80}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>

          <div className="col-span-12">
            <div className="mb-1 flex items-center gap-2">
              <Label className="mb-0">성향 태그</Label>
              <span className="text-xs text-slate-500">(최대 5개)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {temperOptions.map((t) => {
                const on = temperament.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTemper(t)}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      on
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="mt-1 text-xs text-slate-500">{temperament.length}/5 선택됨</div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={create}
            disabled={saving || !name.trim()}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />}
            등록
          </button>
        </div>
      </section>

      {/* 리스트 */}
      <section className="grid grid-cols-12 gap-4">
        {pets.map((p: any) => (
          <div key={p._id} className="col-span-12 md:col-span-6 xl:col-span-4">
            <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {(p.name || "?").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold">{p.name}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {labelSpecies(p.species)}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-500">
                      {(p.breed || "품종 미상")} · {labelSize(p.size)} · {labelSex(p.sex)} {p.age ? `· ${p.age}살` : ""}
                    </div>
                    {!!(p.temperament?.length) && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.temperament.slice(0, 5).map((t: string, i: number) => (
                          <span key={i} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {p.about && <p className="mt-3 text-sm text-slate-700">{p.about}</p>}

                {/* 사진 업로드 */}
                <div className="mt-3">
                  <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                    사진 업로드
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => upload(p._id, e.target.files?.[0])}
                    />
                  </label>
                </div>

                {/* 갤러리 */}
                {!!(p.photos?.length) && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {p.photos.slice(0, 3).map((ph: any, idx: number) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={idx} src={ph.url} alt="" className="h-24 w-full rounded-lg border object-cover" />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between border-t px-5 py-3">
                <button
                  onClick={() => appendSparkle(p)}
                  className="rounded-lg border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  소개에 ✨추가
                </button>
                <button
                  onClick={() => remove(p)}
                  className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 빈 상태 */}
      {!pets.length && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <span>🐾</span>
          아직 등록된 펫이 없어요. 위 폼에서 먼저 등록해 보세요.
        </div>
      )}
    </div>
  );
}

/* ---------- 작은 컴포넌트 & helpers ---------- */

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-1 text-sm font-medium text-slate-700 ${className}`}>{children}</div>;
}

function labelSpecies(s?: string) {
  if (s === "dog") return "강아지";
  if (s === "cat") return "고양이";
  return "기타";
}
function labelSex(s?: string) {
  if (s === "male") return "수컷";
  if (s === "female") return "암컷";
  return "모름";
}
function labelSize(s?: string) {
  if (s === "s") return "소형";
  if (s === "l") return "대형";
  return "중형";
}
