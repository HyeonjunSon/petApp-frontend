"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

type Goal = "데이트" | "친구" | "둘 다";
const GOALS: Goal[] = ["데이트", "친구", "둘 다"];
const INTERESTS = [
  "산책",
  "카페",
  "훈련",
  "사진",
  "미용",
  "캠핑",
  "실내놀이",
  "사회화",
] as const;

/* 업로드 경로 → 절대 URL */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050/api";
const ORIGIN = API_BASE.replace(/\/api$/, "");
const toAbs = (u?: string) =>
  !u ? "" : u.startsWith("http") ? u : `${ORIGIN}${u}`;

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [goal, setGoal] = useState<Goal>("둘 다");
  const [selected, setSelected] = useState<string[]>([]);

  const [meFile, setMeFile] = useState<File | null>(null);
  const [petFile, setPetFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // 캐시버스터: 업로드 후 미리보기 강제 갱신용
  const [photoVersion, setPhotoVersion] = useState(0);

  /* user → 폼 주입 */
  useEffect(() => {
    if (!user) return;
    if (user.name) setName(user.name);
    if ((user as any).about) setBio((user as any).about);
    setGoal(
      GOALS.includes((user as any).goal as Goal)
        ? ((user as any).goal as Goal)
        : "둘 다"
    );
    if (
      Array.isArray((user as any).interests) &&
      (user as any).interests.length > 0
    ) {
      setSelected((user as any).interests);
    }
  }, [user]);

  /* 서버 저장본 중 '최신' 사진을 고르는 헬퍼 + 캐시버스터 */
  const pickLastByType = (u: any, type: string) => {
    const list = Array.isArray(u?.photos) ? u.photos : [];
    // 같은 type 중 마지막(최신) 1개, 없으면 전체 마지막
    const last =
      [...list].reverse().find((p: any) => p.type === type) ||
      list[list.length - 1];
    return last?.url ? toAbs(last.url) : "";
  };
  const withV = (u: string) =>
    u ? `${u}${u.includes("?") ? "&" : "?"}v=${photoVersion}` : "";

  /* 서버 저장본 URL (캐시 버스터 포함) */
  const meServerUrl = useMemo(
    () => withV(pickLastByType(user, "owner_face")),
    [user, photoVersion]
  );
  const petServerUrl = useMemo(
    () => withV(pickLastByType(user, "pet")),
    [user, photoVersion]
  );

  /* 로컬 미리보기 */
  const mePreview = useMemo(
    () => (meFile ? URL.createObjectURL(meFile) : ""),
    [meFile]
  );
  const petPreview = useMemo(
    () => (petFile ? URL.createObjectURL(petFile) : ""),
    [petFile]
  );
  useEffect(
    () => () => {
      if (mePreview) URL.revokeObjectURL(mePreview);
    },
    [mePreview]
  );
  useEffect(
    () => () => {
      if (petPreview) URL.revokeObjectURL(petPreview);
    },
    [petPreview]
  );

  const toggleInterest = (k: string) =>
    setSelected((prev) =>
      prev.includes(k)
        ? prev.filter((v) => v !== k)
        : prev.length < 5
        ? [...prev, k]
        : prev
    );

  /* 저장 */
  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // 1) 텍스트 저장 → 서버가 돌려준 updated를 기준으로 사용
      const { data: updated } = await api.put("/users/me", {
        name,
        about: bio,
        goal,
        interests: selected,
      });

      // 2) 업로드 함수: 업로드 결과만 리턴 (setUser는 여기서 호출하지 않음)
      const upload = async (
        file: File,
        type: "owner_face" | "pet"
      ): Promise<{ url: string; type: "owner_face" | "pet" } | null> => {
        const fd = new FormData();
        fd.append("photo", file);
        fd.append("type", type);
        const { data } = await api.post("/photos", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return data?.url ? { url: data.url, type } : null;
      };

      const uploaded: Array<{ url: string; type: "owner_face" | "pet" }> = [];
      if (meFile) {
        const up = await upload(meFile, "owner_face");
        if (up) uploaded.push(up);
      }
      if (petFile) {
        const up = await upload(petFile, "pet");
        if (up) uploaded.push(up);
      }

      // 3) 사진 교체 규칙: 같은 type은 제거하고 새 업로드로 대체
      const basePhotos =
        (Array.isArray(updated?.photos) ? updated.photos : user?.photos) ?? [];
      const nextPhotos = [
        ...basePhotos.filter(
          (p: any) => !uploaded.some((u) => u.type === p.type)
        ),
        ...uploaded, // 최신 업로드를 뒤에 붙여 최신이 선택되도록
      ];

      // 4) 최종 한 번만 setUser (함수형 업데이트 X → 타입 안전)
      setUser({ ...(updated || user), photos: nextPhotos });

      // 5) UI 정리 + 캐시버스터 증가
      setMeFile(null);
      setPetFile(null);
      try {
        const { data: fresh } = await api.get("/users/me");
        const rev = Date.now(); // 이번 저장 버전(캐시버스터에 사용)
        // 대표 이미지: owner_face 최신 → 없으면 pet 최신
        const latest = (arr: any[] | undefined, type: string) => {
          const list = Array.isArray(arr) ? arr : [];
          const last =
            [...list].reverse().find((p: any) => p?.type === type) ||
            list[list.length - 1];
          const raw = typeof last === "string" ? last : last?.url;
          return raw ? toAbs(raw) : "";
        };
        const rawHeroAbs =
          latest(fresh?.photos, "owner_face") ||
          latest(fresh?.photos, "pet") ||
          "";
        const heroUrl =
          rawHeroAbs &&
          `${rawHeroAbs}${rawHeroAbs.includes("?") ? "&" : "?"}v=${rev}`;
        if (fresh) setUser({ ...fresh, heroUrl, profileRev: rev });
      } catch {}

      // 마지막에 한 번만 버전 올려서 <img key=...> 리마운트
      setPhotoVersion((v) => v + 1);

      alert("프로필을 저장했어요 ✅");
    } catch (e: any) {
      console.error(e);
      alert(
        e?.response?.data?.message ||
          "저장에 실패했어요. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight">프로필</h1>
          <p className="mt-1 text-sm text-slate-600">
            간단합니다—이름, 한줄소개, 목적만 정리하고 사진만 올리면 끝!
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* 좌측: 기본 정보 */}
          <section className="col-span-12 xl:col-span-7 space-y-6">
            <Card title="기본 정보">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="이름">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-500"
                    placeholder="닉네임 또는 실명"
                  />
                </Field>
                <div />
                <Field label="한줄소개" full>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                    placeholder="나를 한 문장으로 소개해요"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    예: 주 3회 산책, 고양이 레크터와 살아요
                  </p>
                </Field>
              </div>
            </Card>

            <Card title="목적">
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`rounded-full border px-4 py-2 text-sm transition
                      ${
                        goal === g
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    type="button"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Card>

            <Card title="관심사 (최대 5개)">
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((k) => {
                  const on = selected.includes(k);
                  const disabled = !on && selected.length >= 5;
                  return (
                    <button
                      key={k}
                      onClick={() => toggleInterest(k)}
                      disabled={disabled}
                      className={`rounded-full px-3 py-1.5 text-sm transition
                        ${
                          on
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : disabled
                            ? "bg-slate-100 text-slate-400"
                            : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                        }`}
                      type="button"
                    >
                      {k}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {selected.length}/5 선택됨
              </p>
            </Card>
          </section>

          {/* 우측: 사진 업로드 + 저장 */}
          <aside className="col-span-12 xl:col-span-5 space-y-6">
            <Card title="사진">
              <div className="grid gap-4 md:grid-cols-2">
                <UploadCard
                  label="내 얼굴"
                  help="첫인상을 좌우해요. 밝은 사진 추천!"
                  file={meFile}
                  preview={mePreview || meServerUrl}
                  onChange={(f) => setMeFile(f)}
                  version={photoVersion}
                />
                <UploadCard
                  label="펫"
                  help="대표 1~3장—너무 많으면 매칭 카드가 복잡해져요."
                  file={petFile}
                  preview={petPreview || petServerUrl}
                  onChange={(f) => setPetFile(f)}
                  version={photoVersion}
                />
              </div>
            </Card>

            <div className="sticky bottom-6">
              <button
                onClick={onSave}
                disabled={saving}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60"
              >
                {saving ? "저장 중..." : "저장하기"}
              </button>
              <p className="mt-2 text-xs text-slate-500">
                저장하면 가이드라인에 따라 검토 후 공개돼요.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ---------- 작은 UI 컴포넌트들 ---------- */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`${full ? "md:col-span-2" : ""} block`}>
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}

function UploadCard({
  label,
  help,
  file,
  preview,
  onChange,
  version = 0,
}: {
  label: string;
  help: string;
  file: File | null;
  preview: string;
  onChange: (f: File | null) => void;
  version?: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-2 text-sm font-medium">{label}</div>

      {/* 미리보기 */}
      <div className="relative mb-3 overflow-hidden rounded-xl bg-slate-100">
        <div className="aspect-[4/3] w-full">
          {preview ? (
            <img
              alt="preview"
              src={preview}
              key={`${label}-${version}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-slate-500">
              미리보기
            </div>
          )}
        </div>
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:border-slate-300">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <span>{file ? "다시 선택하기" : "사진 선택하기"}</span>
      </label>

      <p className="mt-2 text-xs text-slate-500">{help}</p>
    </div>
  );
}
