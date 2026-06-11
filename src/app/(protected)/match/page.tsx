"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import {
  Avatar, Badge, Button, Icon, Sheet, Toast, EmptyState, cx, type ToastData,
} from "@/components/ui";

type Card = {
  id: string;
  petName?: string;
  breed?: string;
  age?: number;
  size?: "s" | "m" | "l";
  goal?: string;
  verified?: boolean;
  temperament?: string[];
  petAbout?: string;
  about?: string;
  ownerName?: string;
  ownerAge?: number;
  location?: string;
  ownerFace?: string;
  photos: string[];
  petPhotos?: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050/api";
const ORIGIN = API_BASE.replace(/\/api$/, "");
const toAbs = (u?: string) => (!u ? "" : u.startsWith("http") ? u : `${ORIGIN}${u}`);

const collectPhotos = (u: any): string[] => {
  const list = Array.isArray(u?.photos) ? u.photos : [];
  // pet photos first, then face photos
  const ordered = [...list].sort((a, b) => {
    const aPet = a?.type === "pet" ? 0 : 1;
    const bPet = b?.type === "pet" ? 0 : 1;
    return aPet - bPet;
  });
  const out = ordered
    .map((p: any) => (typeof p === "string" ? p : p?.url))
    .filter(Boolean)
    .map(toAbs);
  return Array.from(new Set(out));
};

const pickFace = (u: any): string | undefined => {
  const list = Array.isArray(u?.photos) ? u.photos : [];
  const face = list.find((p: any) => p?.type === "owner_face");
  return face?.url ? toAbs(face.url) : undefined;
};

const SIZE_LABEL: Record<string, string> = { s: "S", m: "M", l: "L" };

export default function DiscoverPage() {
  const { user } = useAuth();
  const [deck, setDeck] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState<ToastData>(null);
  const [match, setMatch] = useState<Card | null>(null);
  const [detail, setDetail] = useState<Card | null>(null);
  const [leaving, setLeaving] = useState<"like" | "pass" | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchDeck = useCallback(async () => {
    setLoading(true);
    setErr("");
    setIdx(0);
    setPhotoIdx(0);
    try {
      const { data } = await api.get("/discover");
      const meId = (user as any)?._id;
      const mapped: Card[] = (Array.isArray(data) ? data : [])
        .filter((u: any) => String(u.id ?? u._id) !== String(meId))
        .map((u: any) => {
          // person-first: faces are the main deck; the pet is a secondary element
          const faces = (Array.isArray(u.facePhotos) ? u.facePhotos : []).map(toAbs).filter(Boolean);
          const petPhotos = (Array.isArray(u.petPhotos) ? u.petPhotos : []).map(toAbs).filter(Boolean);
          const pet = u.pet || (Array.isArray(u.pets) ? u.pets[0] : undefined) || undefined;
          const mainPhotos = faces.length ? faces : collectPhotos(u);
          return {
            id: String(u.id ?? u._id),
            ownerName: u.name,
            ownerAge: u.ownerAge ?? (u.birthYear ? new Date().getFullYear() - u.birthYear : undefined),
            location: u.location || u.locationName || "",
            about: u.about || "",
            goal: u.goal,
            verified: u.verified,
            ownerFace: faces[0] || pickFace(u),
            photos: mainPhotos,
            // pet (secondary)
            petName: pet?.name,
            breed: pet?.breed,
            age: pet?.age,
            size: pet?.size,
            temperament: pet?.temperament || [],
            petAbout: pet?.about || pet?.bio || "",
            petPhotos,
          };
        });
      setDeck(mapped);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Couldn't load candidates.");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => { fetchDeck(); }, [fetchDeck]);

  const current = deck[idx];

  const act = useCallback(
    (dir: "like" | "pass") => {
      if (leaving || !current) return;
      setLeaving(dir);
      if (dir === "like") {
        api.post(`/matches/like/${current.id}`).then(({ data }) => {
          if (data?.matchId) {
            setMatch(current);
          } else {
            setToast({ msg: `You liked ${current.petName}`, type: "ok" });
          }
        }).catch(() => {});
      } else {
        api.post(`/matches/pass/${current.id}`).catch(() => {});
        setToast({ msg: "Looking for the next friend", type: "ok" });
      }
      setTimeout(() => {
        setIdx((i) => i + 1);
        setPhotoIdx(0);
        setLeaving(null);
      }, 260);
    },
    [leaving, current]
  );

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (match || detail) return;
      if (e.key === "ArrowLeft") act("pass");
      if (e.key === "ArrowRight") act("like");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act, match, detail]);

  const reset = () => { fetchDeck(); setToast({ msg: "Refreshed", type: "ok" }); };

  return (
    <div className="mx-auto flex max-w-[460px] flex-col items-center">
      <div className="mb-4 flex w-full items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
            Discover
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
            Tap a photo to browse, use the buttons to choose.
          </p>
        </div>
        <Button variant="secondary" size="sm" icon="refresh" onClick={reset} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="relative aspect-[3/4.4] w-full select-none">
        {loading && (
          <div className="surface absolute inset-0 grid place-items-center rounded-3xl text-sm" style={{ color: "var(--ink-faint)" }}>
            Loading candidates…
          </div>
        )}
        {!!err && !loading && (
          <div className="surface absolute inset-0 grid place-items-center rounded-3xl px-6 text-center text-sm" style={{ color: "var(--danger)" }}>
            {err}
          </div>
        )}
        {!loading && !err && !current && (
          <div className="surface absolute inset-0 grid place-items-center rounded-3xl">
            <EmptyState
              emoji="🐾"
              title="No new friends nearby"
              desc="Widen your search radius to meet more pets."
              action={<Button icon="refresh" onClick={reset}>Widen radius</Button>}
            />
          </div>
        )}

        {/* behind card */}
        {!loading && !err && deck[idx + 1] && (
          <div className="absolute inset-0 scale-[0.96]">
            <ClassicCard card={deck[idx + 1]} dimmed />
          </div>
        )}

        {/* top card */}
        {!loading && !err && current && (
          <div
            className={cx(
              "absolute inset-0 transition-all duration-300 ease-out",
              leaving === "like" && "translate-x-[120%] rotate-12 opacity-0",
              leaving === "pass" && "-translate-x-[120%] -rotate-12 opacity-0"
            )}
          >
            <ClassicCard
              card={current}
              photoIdx={photoIdx}
              onTapPhoto={(d) => setPhotoIdx((v) => Math.max(0, Math.min(current.photos.length - 1, v + d)))}
              stamp={leaving}
            />
          </div>
        )}
      </div>

      {/* action buttons */}
      {!loading && !err && current && (
        <div className="mt-6 flex items-center justify-center gap-5">
          <ActionBtn aria="Pass" size={64} bordered onClick={() => act("pass")} disabled={!!leaving}>
            <Icon name="close" size={30} color="var(--pass)" />
          </ActionBtn>
          <ActionBtn aria="Details" size={48} bordered onClick={() => setDetail(current)} disabled={!!leaving}>
            <Icon name="info" size={22} color="var(--ink-soft)" />
          </ActionBtn>
          <ActionBtn aria="Like" size={64} fill onClick={() => act("like")} disabled={!!leaving}>
            <Icon name="heart" fill size={28} color="#fff" />
          </ActionBtn>
        </div>
      )}

      <Toast toast={toast} />

      {/* detail sheet */}
      <Sheet open={!!detail} onClose={() => setDetail(null)} title="Profile">
        {detail && <DetailContent c={detail} />}
      </Sheet>

      {/* match overlay */}
      {match && (
        <MatchOverlay
          c={match}
          onMessage={() => { setMatch(null); window.location.href = `/chat?open=${match.id}`; }}
          onContinue={() => setMatch(null)}
        />
      )}
    </div>
  );
}

/* ---------------- Classic card ---------------- */
function ClassicCard({
  card, photoIdx = 0, onTapPhoto, dimmed, stamp,
}: {
  card: Card;
  photoIdx?: number;
  onTapPhoto?: (d: 1 | -1) => void;
  dimmed?: boolean;
  stamp?: "like" | "pass" | null;
}) {
  const photo = card.photos[photoIdx];
  return (
    <div
      className={cx(dimmed && "brightness-95")}
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        background: "var(--bg)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "var(--sh-swipe)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Photo */}
      <div style={{ position: "relative", flex: 1, minHeight: 0, background: "var(--surface-2)" }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={card.ownerName || "profile"}
            draggable={false}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fb === "1") return;
              img.dataset.fb = "1";
              img.src = "/img/pet-placeholder.svg";
            }}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-5xl">🐾</div>
        )}

        {/* gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(15,23,42,.72) 0%, transparent 38%)",
            pointerEvents: "none",
          }}
        />

        {/* carousel dots */}
        {card.photos.length > 1 && (
          <div style={{ position: "absolute", top: 10, left: 12, right: 12, display: "flex", gap: 4 }}>
            {card.photos.map((_, i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: i === photoIdx ? "#fff" : "rgba(255,255,255,.45)",
                }}
              />
            ))}
          </div>
        )}

        {/* top-right badge — dating goal */}
        <div style={{ position: "absolute", top: 18, right: 12, display: "flex", gap: 6 }}>
          {card.goal && (
            <Badge tone="brand" style={{ background: "var(--brand)", color: "#fff" }}>
              {card.goal}
            </Badge>
          )}
        </div>

        {/* verified */}
        {card.verified && (
          <div style={{ position: "absolute", top: 18, left: 12 }}>
            <Badge tone="glass">
              <Icon name="check" size={12} /> Verified
            </Badge>
          </div>
        )}

        {/* tap zones */}
        {card.photos.length > 1 && onTapPhoto && (
          <>
            <button
              aria-label="Previous photo"
              onClick={(e) => { e.stopPropagation(); onTapPhoto(-1); }}
              style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "33%", background: "transparent", border: "none", cursor: "pointer" }}
            />
            <button
              aria-label="Next photo"
              onClick={(e) => { e.stopPropagation(); onTapPhoto(1); }}
              style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "33%", background: "transparent", border: "none", cursor: "pointer" }}
            />
          </>
        )}

        {/* person name / age / location */}
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, color: "#fff" }}>
          <div style={{ fontSize: 26, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            {card.ownerName || "Someone"}
            {card.ownerAge != null ? <span style={{ fontWeight: 500 }}>{card.ownerAge}</span> : null}
          </div>
          {card.location ? (
            <div style={{ fontSize: 14, opacity: 0.92, display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="pin" size={14} /> {card.location}
            </div>
          ) : null}
        </div>

        {/* stamps */}
        {stamp === "like" && (
          <Stamp text="LIKE" color="var(--brand)" left />
        )}
        {stamp === "pass" && (
          <Stamp text="PASS" color="var(--pass)" />
        )}
      </div>

      {/* Info */}
      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 11,
          flexShrink: 0,
          background: "var(--bg)",
        }}
      >
        {card.about && (
          <p
            className="pd-line2"
            style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.5 }}
          >
            {card.about}
          </p>
        )}
        {card.petName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 10,
              borderRadius: 12,
              background: "var(--bg-subtle)",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "var(--surface-2)", display: "grid", placeItems: "center", fontSize: 20 }}>
              {card.petPhotos && card.petPhotos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.petPhotos[0]} alt={card.petName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                "🐾"
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-faint)" }}>🐾 Comes with</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                {card.petName}
                {card.breed ? ` · ${card.breed}` : ""}
                {card.age != null ? ` · ${card.age}y` : ""}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stamp({ text, color, left }: { text: string; color: string; left?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 26,
        [left ? "left" : "right"]: 20,
        transform: `rotate(${left ? -14 : 14}deg)`,
        border: `3px solid ${color}`,
        color,
        padding: "4px 14px",
        borderRadius: 10,
        fontSize: 26,
        fontWeight: 800,
        letterSpacing: 1,
        background: "rgba(255,255,255,.6)",
        pointerEvents: "none",
      } as React.CSSProperties}
    >
      {text}
    </div>
  );
}

/* ---------------- Action button ---------------- */
function ActionBtn({
  size, bordered, fill, onClick, children, aria, disabled,
}: {
  size: number;
  bordered?: boolean;
  fill?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  aria: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      disabled={disabled}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: fill ? "var(--brand)" : "var(--bg)",
        boxShadow: fill ? "var(--sh-fab)" : "var(--sh-card)",
        border: bordered && !fill ? "1.5px solid var(--border-strong)" : "none",
        transition: "transform .12s",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

/* ---------------- Detail content ---------------- */
function DetailContent({ c }: { c: Card }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: "flex", gap: 8, padding: "4px 16px 14px", overflowX: "auto" }}>
        {c.photos.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={p}
            alt=""
            style={{ width: 150, height: 188, objectFit: "cover", borderRadius: "var(--r-card)", flexShrink: 0 }}
          />
        ))}
      </div>
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{c.petName}</h2>
            {c.size && <Badge tone="slate">{SIZE_LABEL[c.size]}</Badge>}
            {c.goal && <Badge tone="brand">{c.goal}</Badge>}
          </div>
          <div style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 3 }}>
            {c.breed || "—"}
            {c.age != null ? ` · ${c.age}y` : ""}
          </div>
        </div>
        {c.petAbout && (
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{c.petAbout}</p>
        )}
        {c.temperament && c.temperament.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Personality</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {c.temperament.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "5px 11px",
                    borderRadius: 999,
                    background: "var(--brand-soft)",
                    color: "var(--brand-strong)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
        <div style={{ height: 1, background: "var(--border)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar src={c.ownerFace} size={48} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
              {c.ownerName || "Owner"}
              {c.verified && <Icon name="check" size={15} color="var(--brand)" />}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              {c.ownerAge ? `${c.ownerAge}` : ""}
              {c.location ? ` · ${c.location}` : ""}
            </div>
          </div>
        </div>
        <a
          href="/safety"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            color: "var(--ink-faint)", fontSize: 13, fontWeight: 600, padding: 8,
            textDecoration: "none",
          }}
        >
          <Icon name="flag" size={15} /> Report / Block
        </a>
      </div>
    </div>
  );
}

/* ---------------- Match overlay ---------------- */
function MatchOverlay({
  c, onMessage, onContinue,
}: { c: Card; onMessage: () => void; onContinue: () => void }) {
  const { user } = useAuth();
  const myFace = pickFace(user);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "linear-gradient(160deg, var(--brand) 0%, var(--brand-strong) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        color: "#fff",
        animation: "pd-fade .3s ease",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, opacity: 0.9 }}>IT&apos;S A MATCH</div>
      <h1 style={{ margin: "8px 0 28px", fontSize: 28, fontWeight: 800, textAlign: "center" }}>
        You&apos;re walk mates!
      </h1>
      <div style={{ display: "flex", alignItems: "center", animation: "pd-pop .4s ease" }}>
        <Avatar src={myFace} size={108} style={{ boxShadow: "0 0 0 4px rgba(255,255,255,.9)", marginRight: -16, zIndex: 2 }} />
        <Avatar src={c.photos[0] || c.ownerFace} size={108} style={{ boxShadow: "0 0 0 4px rgba(255,255,255,.9)" }} />
      </div>
      <p style={{ margin: "24px 0 32px", fontSize: 16, opacity: 0.95, textAlign: "center" }}>
        {user?.name || "You"} and {c.petName} want to be friends
      </p>
      <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 10 }}>
        <Button
          fullWidth
          size="lg"
          onClick={onMessage}
          icon="chat"
          style={{ background: "#fff", color: "var(--brand-strong)" }}
        >
          Send message
        </Button>
        <button
          onClick={onContinue}
          style={{
            color: "#fff", fontWeight: 700, fontSize: 14, padding: 12, opacity: 0.92,
            background: "transparent", border: "none", cursor: "pointer",
          }}
        >
          Keep browsing
        </button>
      </div>
    </div>
  );
}
