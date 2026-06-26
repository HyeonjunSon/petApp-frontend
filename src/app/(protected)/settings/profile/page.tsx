"use client";

/** 소유자 프로필 수정. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Card as UICard, Button, Input, Textarea, Select, Field, Avatar, Banner, Toast, type ToastData } from "@/components/ui";

const REGIONS = ["서울", "부산", "인천", "대구", "대전", "광주", "경기", "기타"];

export default function OwnerProfileEditPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [region, setRegion] = useState("서울");
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
      setRegion(data?.locationName || "서울");
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
      setToast({ msg: "사진을 업데이트했어요", type: "ok" });
    } catch {
      setToast({ msg: "사진 업로드 실패", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    setBusy(true);
    try {
      await api.delete("/users/me/photo");
      setFace(undefined);
      setToast({ msg: "사진을 삭제했어요", type: "ok" });
    } catch {
      setToast({ msg: "삭제할 수 없어요", type: "error" });
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
    <Page title="프로필 수정" maxWidth={860}>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0] || null)} />

      <UICard>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>프로필 사진</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar src={face} fallbackText={(name || "나")[0]} size={84} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <Button fullWidth disabled={busy} onClick={() => fileRef.current?.click()}>사진 업로드</Button>
            <Button fullWidth variant="secondary" disabled={busy || !face} onClick={removePhoto}>사진 삭제</Button>
          </div>
        </div>
      </UICard>

      <div style={{ height: 16 }} />

      <UICard>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>기본 정보</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="이름"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="나이"><Input value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" /></Field>
          <Field label="지역">
            <Select value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="성별">
            <Select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="undisclosed">미공개</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </Select>
          </Field>
        </div>
      </UICard>

      <div style={{ height: 16 }} />

      <UICard>
        <h2 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>자기소개</h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--ink-soft)" }}>
          반려동물과의 생활 방식, 산책 스타일, 관심사 등을 소개해주세요.
        </p>
        <Field label="자기소개"><Textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="자기소개" /></Field>
        <div style={{ height: 14 }} />
        <Field label="산책 스타일"><Textarea value={walkStyle} onChange={(e) => setWalkStyle(e.target.value)} placeholder="예: 오전 산책 선호, 30분~1시간, 공원 코스" /></Field>
      </UICard>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <Button variant="secondary" onClick={() => router.push("/settings")}>취소</Button>
        <Button onClick={save} loading={busy} icon="check">저장</Button>
      </div>

      <Toast toast={toast} />
    </Page>
  );
}
