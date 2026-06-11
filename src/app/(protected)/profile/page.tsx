"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import {
  Avatar, Badge, Button, Card, CardHeader, Chip, Icon, SectionTitle, Textarea, Toast, cx, type ToastData,
} from "@/components/ui";
import type { Pet } from "@/types/pet";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050/api";
const ORIGIN = API_BASE.replace(/\/api$/, "");
const toAbs = (u?: string) => (!u ? "" : u.startsWith("http") ? u : `${ORIGIN}${u}`);

type Goal = "Dating" | "Friends" | "Both";
const GOALS: Goal[] = ["Dating", "Friends", "Both"];
const INTERESTS = [
  "Walks", "Cafés", "Training", "Photos", "Grooming", "Camping", "Indoor play", "Socializing",
] as const;

const isAllowedImage = (file: File) =>
  /^image\/(png|jpe?g|webp|gif|bmp|svg\+xml)$/.test(file.type) &&
  file.size <= 10 * 1024 * 1024;

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const faceInput = useRef<HTMLInputElement | null>(null);
  const [toast, setToast] = useState<ToastData>(null);

  // editable fields
  const [about, setAbout] = useState("");
  const [goal, setGoal] = useState<Goal>("Both");
  const [interests, setInterests] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // pets
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    if (!user) return;
    setAbout(((user as any).about as string) || "");
    setGoal(GOALS.includes((user as any).goal as Goal) ? ((user as any).goal as Goal) : "Both");
    setInterests(Array.isArray((user as any).interests) ? (user as any).interests : []);
    setDirty(false);
  }, [user?._id]);

  useEffect(() => {
    api.get<Pet[]>("/pets").then(({ data }) => setPets(data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const facePhoto = useMemo(() => {
    const list = Array.isArray(user?.photos) ? user!.photos! : [];
    const last = [...list].reverse().find((p: any) => p?.type === "owner_face");
    return last?.url ? toAbs(last.url) : "";
  }, [user]);

  const toggleInterest = (k: string) => {
    setInterests((prev) =>
      prev.includes(k) ? prev.filter((v) => v !== k) : prev.length >= 5 ? prev : [...prev, k]
    );
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/users/me", { about, goal, interests });
      setUser({ ...(data || user) } as any);
      setDirty(false);
      setToast({ msg: "Profile saved", type: "ok" });
    } catch (e: any) {
      setToast({ msg: e?.response?.data?.message || "Save failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const onFacePick = async (file?: File) => {
    if (!file) return;
    if (!isAllowedImage(file)) {
      setToast({ msg: "Only images up to 10MB", type: "error" });
      return;
    }
    try {
      const fd = new FormData();
      fd.append("photo", file);
      fd.append("type", "owner_face");
      const { data } = await api.post("/users/me/photo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { data: fresh } = await api.get("/users/me");
      setUser(fresh);
      setToast({ msg: "Photo updated", type: "ok" });
      void data;
    } catch (e: any) {
      setToast({ msg: e?.response?.data?.message || "Upload failed", type: "error" });
    }
  };

  const onLogout = async () => {
    try { await api.post("/auth/logout").catch(() => {}); } finally {
      if (typeof window !== "undefined") localStorage.removeItem("token");
      setUser(null);
      router.replace("/login");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => faceInput.current?.click()}
            aria-label="Change profile photo"
            style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", position: "relative" }}
          >
            <Avatar src={facePhoto} size={96} ring />
            <span
              style={{
                position: "absolute",
                right: -2,
                bottom: -2,
                background: "var(--brand)",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                boxShadow: "0 0 0 3px var(--bg)",
              }}
            >
              <Icon name="camera" size={14} />
            </span>
          </button>
          <input
            ref={faceInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { onFacePick(e.target.files?.[0]); if (e.currentTarget) e.currentTarget.value = ""; }}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xl font-extrabold" style={{ color: "var(--ink)" }}>
              {user?.name || "User"}
            </div>
            <div className="mt-0.5 text-sm" style={{ color: "var(--ink-soft)" }}>
              {(user as any)?.locationName || user?.email}
            </div>
            <div className="mt-2 inline-flex">
              <Badge tone="brand">{goal}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* My info */}
      <Card>
        <CardHeader title="About me" subtitle="A short line + interests" />
        <div className="space-y-4">
          <Textarea
            rows={3}
            value={about}
            onChange={(e) => { setAbout(e.target.value); setDirty(true); }}
            placeholder="Introduce yourself in one sentence"
            maxLength={200}
          />

          <div>
            <div className="mb-2 text-sm font-medium" style={{ color: "var(--ink)" }}>
              Goal
            </div>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <Chip key={g} active={goal === g} onClick={() => { setGoal(g); setDirty(true); }}>
                  {g}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium" style={{ color: "var(--ink)" }}>
              Interests <span className="text-xs font-normal" style={{ color: "var(--ink-soft)" }}>(up to 5 · {interests.length}/5)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((k) => {
                const on = interests.includes(k);
                const disabled = !on && interests.length >= 5;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => !disabled && toggleInterest(k)}
                    disabled={disabled}
                    style={{
                      height: 34,
                      padding: "0 14px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: disabled ? "not-allowed" : "pointer",
                      background: on ? "var(--ink)" : "var(--bg)",
                      color: on ? "var(--bg)" : disabled ? "var(--ink-faint)" : "var(--ink)",
                      border: "1px solid",
                      borderColor: on ? "var(--ink)" : "var(--border)",
                    }}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          </div>

          {dirty && (
            <div className="flex justify-end">
              <Button onClick={save} loading={saving}>Save changes</Button>
            </div>
          )}
        </div>
      </Card>

      {/* My pets */}
      <Card padded={false}>
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="text-base font-bold" style={{ color: "var(--ink)" }}>My pets</h2>
          <Link href="/pets" className="text-sm font-semibold" style={{ color: "var(--brand)" }}>
            Manage →
          </Link>
        </div>
        {pets.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--ink-soft)" }}>
            No pets yet.{" "}
            <Link href="/pets" className="underline" style={{ color: "var(--brand-strong)" }}>
              Add a pet
            </Link>
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {pets.slice(0, 5).map((p) => {
              const cover = p.photos?.[0]?.url;
              return (
                <li key={p._id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={cover ? toAbs(cover) : undefined} size={44} />
                    <div className="min-w-0">
                      <div className="font-semibold" style={{ color: "var(--ink)" }}>{p.name}</div>
                      <div className="truncate text-xs" style={{ color: "var(--ink-soft)" }}>
                        {labelType(p.type)}{p.breed ? ` · ${p.breed}` : ""}{p.age != null ? ` · ${p.age}y` : ""}
                      </div>
                    </div>
                  </div>
                  <Link href="/pets" className="text-sm" style={{ color: "var(--brand-strong)" }}>
                    Edit
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Link list */}
      <Card padded={false}>
        <ul>
          <LinkItem icon="camera" label="Photos" href="/photos" />
          <LinkItem icon="shield" label="Report / Block" href="/safety" />
          <LinkItem icon="cog" label="Settings" href="/settings" />
          <LinkItem icon="logout" label="Log out" danger onClick={onLogout} />
        </ul>
      </Card>

      <Toast toast={toast} />
    </div>
  );
}

function LinkItem({
  icon, label, href, danger, onClick,
}: {
  icon: any;
  label: string;
  href?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div
      className="flex items-center justify-between px-5 py-3.5"
      style={{ color: danger ? "var(--danger)" : "var(--ink)" }}
    >
      <div className="flex items-center gap-3">
        <span
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: "var(--surface-2)" }}
        >
          <Icon name={icon} size={18} />
        </span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      {!onClick && <Icon name="fwd" size={18} color="var(--ink-faint)" />}
    </div>
  );
  if (onClick) {
    return (
      <li
        className="border-b last:border-0"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          type="button"
          onClick={onClick}
          style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
        >
          {content}
        </button>
      </li>
    );
  }
  return (
    <li
      className="border-b last:border-0"
      style={{ borderColor: "var(--border)" }}
    >
      <Link href={href!}>{content}</Link>
    </li>
  );
}

function labelType(s?: string) {
  if (s === "dog") return "Dog";
  if (s === "cat") return "Cat";
  return "Pet";
}
