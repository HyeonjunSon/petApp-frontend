"use client";

/** 보호자 프로필 수정. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Button, Input, Textarea, Select, Field, Avatar, Banner, Toast, type ToastData } from "@/components/ui";

const REGIONS = [
  { v: "Seoul", label: "서울" },
  { v: "Busan", label: "부산" },
  { v: "Incheon", label: "인천" },
  { v: "Daegu", label: "대구" },
  { v: "Daejeon", label: "대전" },
  { v: "Gwangju", label: "광주" },
  { v: "Gyeonggi", label: "경기" },
  { v: "Other", label: "기타" },
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
      setToast({ msg: "사진이 변경되었어요", type: "ok" });
    } catch {
      setToast({ msg: "사진 업로드에 실패했어요", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    setBusy(true);
    try {
      await api.delete("/users/me/photo");
      setFace(undefined);
      setToast({ msg: "사진이 삭제되었어요", type: "ok" });
    } catch {
      setToast({ msg: "사진을 삭제하지 못했어요", type: "error" });
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
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="프로필 수정" subtitle="다른 보호자에게 보여질 내 정보를 관리해요." maxWidth={860}>
      <style>{`.pdi:focus{box-shadow:0 0 0 2px var(--primary)}`}</style>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0] || null)} />

      <Card>
        <CardTitle>프로필 사진</CardTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar src={face} fallbackText={(name || "나")[0]} size={84} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <Button fullWidth disabled={busy} onClick={() => fileRef.current?.click()}>사진 업로드</Button>
            <Button fullWidth variant="secondary" disabled={busy || !face} onClick={removePhoto}>사진 삭제</Button>
          </div>
        </div>
      </Card>

      <div style={{ height: 16 }} />

      <Card>
        <CardTitle>기본 정보</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="이름"><Input className="pdi" style={INPUT_STYLE} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="나이"><Input className="pdi" style={INPUT_STYLE} value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" /></Field>
          <Field label="지역">
            <Select className="pdi" style={INPUT_STYLE} value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
            </Select>
          </Field>
          <Field label="성별">
            <Select className="pdi" style={INPUT_STYLE} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="undisclosed">비공개</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </Select>
          </Field>
        </div>
      </Card>

      <div style={{ height: 16 }} />

      <Card>
        <h2 style={{ margin: "0 0 6px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>소개</h2>
        <p style={{ margin: "0 0 12px", fontSize: "var(--fs-meta)", color: "var(--text-secondary)" }}>
          라이프스타일, 산책 스타일, 관심사를 알려주세요.
        </p>
        <Field label="한 줄 소개"><Textarea className="pdi" style={AREA_STYLE} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="나를 소개해 주세요" /></Field>
        <div style={{ height: 14 }} />
        <Field label="산책 스타일"><Textarea className="pdi" style={AREA_STYLE} value={walkStyle} onChange={(e) => setWalkStyle(e.target.value)} placeholder="예: 아침 산책 선호, 30분~1시간, 공원 코스" /></Field>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <Button variant="secondary" onClick={() => router.push("/settings")}>취소</Button>
        <Button onClick={save} loading={busy} icon="check">저장</Button>
      </div>

      <Toast toast={toast} />
    </Page>
  );
}
