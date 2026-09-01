"use client";

/** 펫 프로필 수정. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page, ImagePlaceholder } from "@/components/shell/Page";
import { Button, Input, Textarea, Select, Field, Chip, Banner, Spinner, EmptyState, Toast, type ToastData } from "@/components/ui";
import { toAbs } from "@/lib/card";

const TEMPERAMENTS = [
  { v: "Energetic", label: "Energetic" },
  { v: "Gentle", label: "Gentle" },
  { v: "Shy", label: "Shy" },
  { v: "Friendly", label: "Friendly" },
  { v: "Independent", label: "Independent" },
];

const INPUT_STYLE: React.CSSProperties = {
  border: "none",
  background: "var(--paper)",
  borderRadius: "var(--radius-input)",
  height: 46,
};
const AREA_STYLE: React.CSSProperties = {
  border: "none",
  background: "var(--paper)",
  borderRadius: "var(--radius-input)",
};

type Pet = {
  _id: string;
  name?: string;
  breed?: string;
  age?: number;
  sex?: string;
  size?: string;
  temperament?: string[];
  about?: string;
  photos?: { url: string }[];
};

function Card({ children }: { children: React.ReactNode }) {
  return <section className="card" style={{ padding: 20 }}>{children}</section>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ margin: "0 0 16px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>
      {children}
    </h2>
  );
}

export default function PetEditPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData>(null);

  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("male");
  const [size, setSize] = useState("s");
  const [temper, setTemper] = useState<string[]>([]);
  const [about, setAbout] = useState("");
  const [preview, setPreview] = useState<string | undefined>(undefined);

  useEffect(() => {
    api.get<Pet[]>("/pets").then(({ data }) => {
      const p = (data || [])[0] || null;
      setPet(p);
      if (p) {
        setName(p.name || "");
        setBreed(p.breed || "");
        setAge(p.age != null ? String(p.age) : "");
        setSex(p.sex || "male");
        setSize(p.size || "s");
        setTemper(p.temperament || []);
        setAbout(p.about || "");
        setPreview(toAbs(p.photos?.[0]?.url) || undefined);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const toggle = (v: string) =>
    setTemper((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]));

  const onPick = async (f: File | null) => {
    if (!f || !pet) return;
    setPreview(URL.createObjectURL(f));
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("photo", f);
      await api.post(`/pets/${pet._id}/photo`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setToast({ msg: "Photo updated", type: "ok" });
    } catch {
      setToast({ msg: "Failed to upload photo", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!pet) return;
    setBusy(true);
    setErr(null);
    try {
      await api.put(`/pets/${pet._id}`, {
        name: name.trim(),
        type: "dog",
        breed: breed || undefined,
        age: age ? Number(age) : undefined,
        sex,
        size,
        temperament: temper,
        about: about || undefined,
      });
      router.push("/settings");
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "Failed to save.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Page title="Edit pet profile">
        <div className="flex justify-center pt-16" style={{ color: "var(--text-secondary)" }}><Spinner /></div>
      </Page>
    );
  }

  if (!pet) {
    return (
      <Page title="Edit pet profile">
        <EmptyState
          emoji="🐶"
          title="No pet registered yet"
          desc="Create a pet profile first."
          action={<Button onClick={() => router.push("/onboarding")}>Add a pet</Button>}
        />
      </Page>
    );
  }

  return (
    <Page title="Edit pet profile" subtitle="Manage your pet's info." maxWidth={860}>
      <style>{`.pdi:focus{outline:2px solid var(--ink) !important}`}</style>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0] || null)} />

      <Card>
        <CardTitle>Profile photo</CardTitle>
        <ImagePlaceholder src={preview} label="Pet photo" height={200} />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <Button variant="secondary" fullWidth disabled={busy} onClick={() => fileRef.current?.click()}>Upload photo</Button>
        </div>
      </Card>

      <div style={{ height: 16 }} />

      <Card>
        <CardTitle>Basic info</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Name"><Input className="pdi" style={INPUT_STYLE} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Breed" className="flex-1"><Input className="pdi" style={INPUT_STYLE} value={breed} onChange={(e) => setBreed(e.target.value)} /></Field>
            <Field label="Age (years)"><Input className="pdi" style={{ ...INPUT_STYLE, width: 120 }} value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" /></Field>
          </div>
          <Field label="Sex">
            <Select className="pdi" style={INPUT_STYLE} value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </Select>
          </Field>
          <Field label="Size">
            <Select className="pdi" style={INPUT_STYLE} value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="s">Small (under 7kg)</option>
              <option value="m">Medium (7–15kg)</option>
              <option value="l">Large (over 15kg)</option>
            </Select>
          </Field>
        </div>
      </Card>

      <div style={{ height: 16 }} />

      <Card>
        <h2 style={{ margin: "0 0 14px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>Temperament & walk style</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {TEMPERAMENTS.map((tp) => (
            <Chip key={tp.v} active={temper.includes(tp.v)} onClick={() => toggle(tp.v)}>{tp.label}</Chip>
          ))}
        </div>
        <Field label="Short bio"><Textarea className="pdi" style={AREA_STYLE} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Tell us about your pet" /></Field>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <Button variant="secondary" onClick={() => router.push("/settings")}>Cancel</Button>
        <Button onClick={save} loading={busy} icon="check">Save</Button>
      </div>

      <Toast toast={toast} />
    </Page>
  );
}
