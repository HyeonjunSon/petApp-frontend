"use client";

/** 펫 프로필 수정. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page, ImagePlaceholder } from "@/components/shell/Page";
import { Card as UICard, Button, Input, Textarea, Select, Field, Chip, Banner, Spinner, EmptyState, Toast, type ToastData } from "@/components/ui";
import { toAbs } from "@/lib/card";

const TEMPERAMENTS = ["Energetic", "Gentle", "Shy", "Friendly", "Independent"];

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
      setToast({ msg: "Photo upload failed", type: "error" });
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
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Page title="Edit pet profile">
        <div className="flex justify-center pt-16" style={{ color: "var(--ink-soft)" }}><Spinner /></div>
      </Page>
    );
  }

  if (!pet) {
    return (
      <Page title="Edit pet profile">
        <EmptyState
          emoji="🐶"
          title="No pet yet"
          desc="Add a pet profile first."
          action={<Button onClick={() => router.push("/onboarding")}>Add a pet</Button>}
        />
      </Page>
    );
  }

  return (
    <Page title="Edit pet profile" maxWidth={860}>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0] || null)} />

      <UICard>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Profile photo</h2>
        <ImagePlaceholder src={preview} label="Pet photo" height={200} />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <Button variant="secondary" fullWidth disabled={busy} onClick={() => fileRef.current?.click()}>Upload photo</Button>
        </div>
      </UICard>

      <div style={{ height: 16 }} />

      <UICard>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Basics</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Pet name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Breed" className="flex-1"><Input value={breed} onChange={(e) => setBreed(e.target.value)} /></Field>
            <Field label="Age (yrs)"><Input value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" style={{ width: 120 }} /></Field>
          </div>
          <Field label="Gender">
            <Select value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </Select>
          </Field>
          <Field label="Size">
            <Select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="s">Small (≤7kg)</option>
              <option value="m">Medium (7–15kg)</option>
              <option value="l">Large (≥15kg)</option>
            </Select>
          </Field>
        </div>
      </UICard>

      <div style={{ height: 16 }} />

      <UICard>
        <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Temperament & walk style</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {TEMPERAMENTS.map((tp) => (
            <Chip key={tp} active={temper.includes(tp)} onClick={() => toggle(tp)}>{tp}</Chip>
          ))}
        </div>
        <Field label="Short bio"><Textarea value={about} onChange={(e) => setAbout(e.target.value)} /></Field>
      </UICard>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <Button variant="secondary" onClick={() => router.push("/settings")}>Cancel</Button>
        <Button onClick={save} loading={busy} icon="check">Save</Button>
      </div>

      <Toast toast={toast} />
    </Page>
  );
}
