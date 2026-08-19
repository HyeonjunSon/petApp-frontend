"use client";

/** 보호자 프로필 수정. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Button, Input, Textarea, Select, Field, Avatar, Banner, Toast, type ToastData } from "@/components/ui";

const REGIONS = [
  { v: "Seoul", label: "Seoul" },
  { v: "Busan", label: "Busan" },
  { v: "Incheon", label: "Incheon" },
  { v: "Daegu", label: "Daegu" },
  { v: "Daejeon", label: "Daejeon" },
  { v: "Gwangju", label: "Gwangju" },
  { v: "Gyeonggi", label: "Gyeonggi" },
  { v: "Other", label: "Other" },
];

const INPUT_STYLE: React.CSSProperties = {
  border: "none",
  background: "var(--input-bg)",
  borderRadius: 10,
  height: 46,
};
const AREA_STYLE: React.CSSProperties = {
  border: "none",
  background: "var(--input-bg)",
  borderRadius: 10,
};

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section className="pd-card" style={{ padding: 20, ...style }}>
      {children}
    </section>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ margin: "0 0 16px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>
      {children}
    </h2>
  );
}

export default function OwnerProfileEditPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [region, setRegion] = useState("Seoul");
  const [gender, setGender] = useState("undisclosed");
  const [about, setAbout] = useState("");
  const [walkStyle, setWalkStyle] = useState("");
  const [face, setFace] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData>(null);

  useEffect(() => {
    api.get("/users/me").then(({ data }) => {
      setName(data?.name || "");
      setAge(data?.age ? String(data.age) : data?.birthYear ? String(data.birthYear) : "");
      setRegion(data?.locationName || "Seoul");
      setGender(data?.gender || "undisclosed");
      setAbout(data?.about || "");
      setWalkStyle(data?.walkStyle || "");
      setFace((data?.faceUrl) || (data?.photos || []).find((p: any) => p.type === "owner_face")?.url);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const onPick = async (f: File | null) => {
    if (!f) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("photo", f);
      await api.post("/users/me/photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const { data } = await api.get("/users/me");
      setUser(data);
      setFace((data?.faceUrl) || (data?.photos || []).find((p: any) => p.type === "owner_face")?.url);
      setToast({ msg: "Photo updated", type: "ok" });
    } catch {
      setToast({ msg: "Failed to upload photo", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    setBusy(true);
    try {
      await api.delete("/users/me/photo");
      setFace(undefined);
      setToast({ msg: "Photo removed", type: "ok" });
    } catch {
      setToast({ msg: "Failed to remove photo", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.put("/users/me", {
        name: name.trim() || undefined,
        about: about || undefined,
        locationName: region || undefined,
        gender,
        age: age ? Number(age) : undefined,
        walkStyle: walkStyle || undefined,
      });
      const { data } = await api.get("/users/me");
      setUser(data);
      router.push("/settings");
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "Failed to save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Edit profile" subtitle="Manage the info other owners will see." maxWidth={860}>
      <style>{`.pdi:focus{box-shadow:0 0 0 2px var(--primary)}`}</style>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0] || null)} />

      <Card>
        <CardTitle>Profile photo</CardTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar src={face} fallbackText={(name || "Me")[0]} size={84} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <Button fullWidth disabled={busy} onClick={() => fileRef.current?.click()}>Upload photo</Button>
            <Button fullWidth variant="secondary" disabled={busy || !face} onClick={removePhoto}>Remove photo</Button>
          </div>
        </div>
      </Card>

      <div style={{ height: 16 }} />

      <Card>
        <CardTitle>Basic info</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Name"><Input className="pdi" style={INPUT_STYLE} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Age"><Input className="pdi" style={INPUT_STYLE} value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Region">
            <Select className="pdi" style={INPUT_STYLE} value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
            </Select>
          </Field>
          <Field label="Gender">
            <Select className="pdi" style={INPUT_STYLE} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="undisclosed">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </Field>
        </div>
      </Card>

      <div style={{ height: 16 }} />

      <Card>
        <h2 style={{ margin: "0 0 6px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>About</h2>
        <p style={{ margin: "0 0 12px", fontSize: "var(--fs-meta)", color: "var(--text-secondary)" }}>
          Share your lifestyle, walk style, and interests.
        </p>
        <Field label="Short bio"><Textarea className="pdi" style={AREA_STYLE} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Tell us about yourself" /></Field>
        <div style={{ height: 14 }} />
        <Field label="Walk style"><Textarea className="pdi" style={AREA_STYLE} value={walkStyle} onChange={(e) => setWalkStyle(e.target.value)} placeholder="e.g. Prefer morning walks, 30 min to 1 hour, park routes" /></Field>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <Button variant="secondary" onClick={() => router.push("/settings")}>Cancel</Button>
        <Button onClick={save} loading={busy} icon="check">Save</Button>
      </div>

      <Toast toast={toast} />
    </Page>
  );
}
