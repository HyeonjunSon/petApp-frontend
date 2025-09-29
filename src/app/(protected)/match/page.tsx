"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

type Card = {
  id: string;
  name: string;
  age?: number;
  breed?: string;
  photos?: string[];
  isMe?: boolean;
};

/* ---- URL/이미지 헬퍼 ---- */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050/api";
const ORIGIN = API_BASE.replace(/\/api$/, "");
const toAbs = (u?: string) =>
  !u ? undefined : u.startsWith("http") ? u : `${ORIGIN}${u}`;
const normalize = (u?: string) => (u ? toAbs(u) : undefined);
const withV = (u?: string, v?: number) =>
  !u ? undefined : `${u}${u.includes("?") ? "&" : "?"}v=${v ?? Date.now()}`;

const findFromEnd = <T,>(arr: T[] | undefined, pred: (x: T) => boolean) => {
  if (!Array.isArray(arr) || !arr.length) return undefined;
  for (let i = arr.length - 1; i >= 0; i--) if (pred(arr[i]!)) return arr[i];
  return undefined;
};
// 문자열/객체 혼합에서도 'url 문자열'만 뽑기
const toUrlString = (p: any): string | undefined =>
  typeof p === "string" ? p : p?.url;

/** 어떤 응답 스키마든 펫 사진 URL을 찾아내기 */
const getPetUrlFromUser = (u: any): string | undefined => {
  // 1) user.photos에서 type === 'pet'
  const petObj = findFromEnd(u?.photos, (p: any) => p?.type === "pet" && !!toUrlString(p));
  if (petObj) return toUrlString(petObj);

  // 2) pets[*] 안의 photos/images/image/photo
  if (Array.isArray(u?.pets) && u.pets.length) {
    for (const pet of u.pets) {
      const fromPhotos = toUrlString(findFromEnd(pet?.photos, (x: any) => !!toUrlString(x)));
      if (fromPhotos) return fromPhotos;

      const fromImages = toUrlString(findFromEnd(pet?.images, (x: any) => !!toUrlString(x)));
      if (fromImages) return fromImages;

      const single = toUrlString(pet?.image) || toUrlString(pet?.photo);
      if (single) return single;
    }
  }

  // 3) 전부 문자열일 때 파일명/경로 힌트로 'pet' 후보 찾기
  const petLike = findFromEnd(u?.photos, (p: any) => {
    const s = toUrlString(p);
    return !!s && (/(\b|\/)pet[-_/]/i.test(s) || /\/pets?\//i.test(s));
  });
  if (petLike) return toUrlString(petLike);

  return undefined;
};

/* ---- API 경로 ---- */
const DISCOVER_PATH = "/discover";
const LIKE_PATH = (id: string) => `/matches/like/${id}`;
const PASS_PATH = (id: string) => `/matches/pass/${id}`;

export default function MatchPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [meCard, setMeCard] = useState<Card | null>(null);
  const [others, setOthers] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [processing, setProcessing] = useState(false);
  const [pressed, setPressed] = useState<"like" | "pass" | null>(null);

  /* ----- 내 카드: 펫 최신 1장만 (없으면 이미지 없음) ----- */
  useEffect(() => {
    if (!user) return;

    const myName = user.name || (user as any).email || "Me";
    const myPet = Array.isArray((user as any).pets)
      ? (user as any).pets[0]
      : undefined;

    const petRaw = getPetUrlFromUser(user);
    const hero = withV(normalize(petRaw), user.profileRev);

    setMeCard({
      id: "me",
      name: myPet ? `${myPet?.breed || "Pet"} - ${myName}` : myName,
      age: myPet?.age,
      breed: myPet?.breed,
      photos: hero ? [hero] : [],
      isMe: true,
    });
  }, [user?.profileRev, user?.photos, (user as any)?.pets]);

  /* ----- 후보 로드: 자기 자신 제거 + 펫 최신 1장 ----- */
  const fetchOthers = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get(DISCOVER_PATH);

      const meId = (user as any)?._id;
      const meEmail = (user as any)?.email;

      const mapped: Card[] = (Array.isArray(data) ? data : [])
        .filter(
          (u: any) =>
            String(u._id) !== String(meId) && (u.email ? u.email !== meEmail : true)
        )
        .map((u: any) => {
          const petRaw = getPetUrlFromUser(u);
          const photo = withV(normalize(petRaw));
          return {
            id: String(u.id ?? u._id),
            name: u.name ?? "이름 없음",
            age: u.age,
            breed: u.breed,
            photos: photo ? [photo] : [], // 펫 없으면 빈 이미지(얼굴로 폴백 X)
          };
        });

      setOthers(mapped);
    } catch (e: any) {
      console.error(e);
      setErr(e?.response?.data?.message || "후보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.email]);

  useEffect(() => {
    fetchOthers();
  }, [fetchOthers]);

  /* ----- 카드 배열/네비게이션 ----- */
  const cards = useMemo(() => (meCard ? [meCard, ...others] : others), [meCard, others]);
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [cards.length]);
  const current = cards[idx];
  const canPrev = idx > 0;
  const canNext = idx < cards.length - 1;

  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx((i) => Math.min(cards.length - 1, i + 1)), [cards.length]);
  const reset = () => setIdx(0);

  // 눌림 효과
  const blip = (k: "like" | "pass") => {
    setPressed(k);
    setTimeout(() => setPressed(null), 150);
  };

  // 좋아요
  const like = async (c: Card) => {
    if (!c) return;
    blip("like");
    next();
    if (c.isMe) return;

    if (processing) return;
    setProcessing(true);
    try {
      const { data } = await api.post(LIKE_PATH(c.id));
      if (data?.matchId) router.push(`/chat?open=${data.matchId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  // 패스
  const pass = async (c: Card) => {
    if (!c) return;
    blip("pass");
    next();
    if (c.isMe) return;

    if (processing) return;
    setProcessing(true);
    try {
      await api.post(PASS_PATH(c.id));
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  // 키보드 ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  /* ----- UI ----- */
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">매칭</h1>
          <p className="mt-1 text-sm text-slate-600">
            첫 카드는 <b>내 프로필 미리보기</b>예요. 좌/우 화살표로 카드를 넘기세요.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOthers}
            disabled={loading || processing}
            className="rounded-lg border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            새로고침
          </button>
          <button
            onClick={reset}
            disabled={processing}
            className="hidden rounded-lg border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40 md:inline-flex"
          >
            리셋
          </button>
        </div>
      </div>

      {/* 로딩/에러 */}
      {loading && (
        <div className="mx-auto mb-4 max-w-[720px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          후보를 불러오는 중…
        </div>
      )}
      {!!err && (
        <div className="mx-auto mb-4 max-w-[720px] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* 카드 스테이지 */}
      <div className="mx-auto grid max-w-[720px] grid-cols-[56px_1fr_56px] items-center gap-3">
        {/* Prev */}
        <button
          onClick={prev}
          disabled={!canPrev || processing}
          aria-label="이전 카드"
          className="grid h-12 w-14 place-items-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ←
        </button>

        {/* Card */}
        <div className="relative h-[520px] w-full">
          <div
            key={current?.id ?? "empty"}
            className="absolute inset-0 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300"
          >
            {/* 머리띠 */}
            {current?.isMe && (
              <div className="rounded-t-2xl bg-emerald-600/95 py-1.5 text-center text-xs font-semibold text-white">
                내 프로필 미리보기
              </div>
            )}

            {/* 이미지 */}
            {current?.photos?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.photos[0]}
                alt={current.name}
                key={`${current.id}-${current.photos[0]}`}
                className="h-64 w-full rounded-t-[inherit] object-cover"
              />
            ) : (
              <div className="grid h-64 w-full place-items-center rounded-t-[inherit] bg-slate-100 text-slate-400">
                이미지 없음
              </div>
            )}

            {/* 본문 */}
            <div className="flex h-[calc(100%-16rem)] flex-col justify-between p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-semibold">{current?.name ?? "—"}</h2>
                  {current?.breed && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {current.breed}
                    </span>
                  )}
                  {typeof current?.age === "number" && (
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-700">
                      {current.age}살
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {current?.isMe ? "다른 사람에게는 이렇게 보여요." : "산책·카페 좋아해요. 매칭 후 대화로 더 알아가요!"}
                </p>
              </div>

              {/* 액션 */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => pass(current!)}
                  disabled={!current || processing}
                  aria-label="패스"
                  className={[
                    "grid h-14 w-14 place-items-center rounded-full border text-red-700 disabled:opacity-40",
                    "border-red-300 bg-red-50 hover:bg-red-100",
                    pressed === "pass" ? "scale-95 bg-red-200" : "",
                  ].join(" ")}
                >
                  ✕
                </button>
                <button
                  onClick={() => like(current!)}
                  disabled={!current || processing}
                  aria-label="좋아요"
                  className={[
                    "grid h-14 w-14 place-items-center rounded-full border text-emerald-700 disabled:opacity-40",
                    "border-emerald-300 bg-emerald-50 hover:bg-emerald-100",
                    pressed === "like" ? "scale-95 bg-emerald-200" : "",
                  ].join(" ")}
                >
                  ♥
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Next */}
        <button
          onClick={next}
          disabled={!canNext || processing}
          aria-label="다음 카드"
          className="grid h-12 w-14 place-items-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          →
        </button>
      </div>

      {/* 인디케이터 + 빈상태 */}
      <div className="mx-auto mt-4 flex max-w-[720px] items-center justify-center gap-1.5">
        {cards.map((_, i) => (
          <span key={i} className={`h-1.5 w-6 rounded-full ${i === idx ? "bg-emerald-600" : "bg-slate-300"}`} />
        ))}
      </div>

      {!cards.length && !loading && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          매칭 카드가 없습니다. 프로필과 펫 정보를 먼저 등록해 주세요.
        </div>
      )}
    </div>
  );
}
