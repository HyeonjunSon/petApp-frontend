"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page, ImagePlaceholder } from "@/components/shell/Page";
import {
  Button,
  Input,
  Textarea,
  Select,
  Field,
  Chip,
  Banner,
} from "@/components/ui";

const apiErr = (e: any) =>
  e?.response?.data?.msg ||
  e?.response?.data?.error ||
  e?.response?.data?.message ||
  e?.message ||
  "문제가 발생했어요. 잠시 후 다시 시도해 주세요.";

const PURPOSES = [
  { v: "Socializing", label: "친목 · 교류" },
  { v: "Exercise & health", label: "운동 · 건강" },
  { v: "Pup socialization", label: "퍼피 사회화" },
  { v: "Regular walk partner", label: "정기 산책 메이트" },
  { v: "One-time walk", label: "일회성 산책" },
];
const TEMPERAMENTS = [
  { v: "Energetic", label: "활발함" },
  { v: "Gentle", label: "온순함" },
  { v: "Shy", label: "낯가림" },
  { v: "Friendly", label: "친화적" },
  { v: "Independent", label: "독립적" },
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "var(--fs-caption)",
        color: "var(--text-secondary)",
        fontWeight: 700,
        margin: "18px 0 10px",
      }}
    >
      {children}
    </div>
  );
}

function StepPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "var(--primary-10)",
        color: "var(--primary)",
        fontSize: "var(--fs-micro)",
        fontWeight: 700,
        borderRadius: "var(--radius-pill)",
        padding: "4px 12px",
        marginBottom: 12,
      }}
    >
      {children}
    </span>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // step 1 — owner
  const [name, setName] = useState(user?.name || "");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("male");
  const [location, setLocation] = useState(user?.locationName || "");
  const [about, setAbout] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState((user as any)?.email || "");
  const [purposes, setPurposes] = useState<string[]>([]);

  // step 2 — pet
  const [petName, setPetName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("male");
  const [size, setSize] = useState("s");
  const [petAbout, setPetAbout] = useState("");
  const [temper, setTemper] = useState<string[]>([]);
  const [petFile, setPetFile] = useState<File | null>(null);
  const [petPreview, setPetPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit1 = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.put("/users/me", {
        name: name.trim() || undefined,
        about: about || undefined,
        locationName: location || undefined,
        interests: purposes,
        birthYear: birthYear ? Number(birthYear) : undefined,
        gender,
        phone: phone || undefined,
      });
      setStep(2);
    } catch (e) {
      setErr(apiErr(e));
    } finally {
      setBusy(false);
    }
  };

  const submit2 = async () => {
    setBusy(true);
    setErr(null);
    try {
      if (petName.trim()) {
        const { data: pet } = await api.post("/pets", {
          name: petName.trim(),
          type: "dog",
          breed: breed || undefined,
          age: age ? Number(age) : undefined,
          sex,
          size,
          temperament: temper,
          about: petAbout || undefined,
        });
        if (petFile && pet?._id) {
          const fd = new FormData();
          fd.append("photo", petFile);
          await api.post(`/pets/${pet._id}/photo`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }
      const { data: fresh } = await api.get("/users/me");
      setUser(fresh);
      router.replace("/discover");
    } catch (e) {
      setErr(apiErr(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page maxWidth={860}>
      <style>{`.pdi:focus{box-shadow:0 0 0 2px var(--primary)}`}</style>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      {step === 1 ? (
        <section className="pd-card" style={{ padding: 24 }}>
          <StepPill>1 / 2 단계</StepPill>
          <h1 style={{ margin: 0, fontSize: "var(--fs-h1)", fontWeight: 800, color: "var(--text)" }}>
            보호자 정보
          </h1>
          <p style={{ margin: "6px 0 18px", fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
            산책 매칭을 위해 보호자님에 대해 알려주세요.
          </p>

          <SectionLabel>기본 정보</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="이름">
              <Input className="pdi" style={INPUT_STYLE} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="출생 연도" className="flex-1">
                <Input className="pdi" style={INPUT_STYLE} value={birthYear} onChange={(e) => setBirthYear(e.target.value)} inputMode="numeric" placeholder="1995" />
              </Field>
              <Field label="성별">
                <Select className="pdi" style={{ ...INPUT_STYLE, width: 120 }} value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="undisclosed">비공개</option>
                </Select>
              </Field>
            </div>
            <Field label="지역">
              <Input className="pdi" style={INPUT_STYLE} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="서울 마포구" />
            </Field>
            <Field label="한 줄 소개">
              <Textarea className="pdi" style={AREA_STYLE} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="나를 소개해 주세요" />
            </Field>
          </div>

          <SectionLabel>연락처</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="휴대폰 번호">
              <Input className="pdi" style={INPUT_STYLE} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
            </Field>
            <Field label="이메일">
              <Input className="pdi" style={INPUT_STYLE} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" />
            </Field>
          </div>

          <SectionLabel>산책 목적</SectionLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PURPOSES.map((p) => (
              <Chip key={p.v} active={purposes.includes(p.v)} onClick={() => toggle(purposes, setPurposes, p.v)}>
                {p.label}
              </Chip>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <Button onClick={submit1} loading={busy} icon="fwd">
              다음 — 펫 프로필 만들기
            </Button>
          </div>
        </section>
      ) : (
        <section className="pd-card" style={{ padding: 24 }}>
          <StepPill>2 / 2 단계</StepPill>
          <h1 style={{ margin: 0, fontSize: "var(--fs-h1)", fontWeight: 800, color: "var(--text)" }}>
            펫 프로필 만들기
          </h1>
          <p style={{ margin: "6px 0 18px", fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
            우리 아이를 소개해 주세요.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setPetFile(f);
              setPetPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{ display: "block", width: "100%", border: "none", background: "transparent", padding: 0, cursor: "pointer" }}
          >
            <ImagePlaceholder src={petPreview || undefined} label="펫 사진" height={180} />
          </button>

          <SectionLabel>기본 정보</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="이름">
              <Input className="pdi" style={INPUT_STYLE} value={petName} onChange={(e) => setPetName(e.target.value)} />
            </Field>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="견종" className="flex-1">
                <Input className="pdi" style={INPUT_STYLE} value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="포메라니안" />
              </Field>
              <Field label="나이 (살)">
                <Input className="pdi" style={{ ...INPUT_STYLE, width: 120 }} value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" />
              </Field>
            </div>
            <Field label="성별">
              <Select className="pdi" style={INPUT_STYLE} value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">남아</option>
                <option value="female">여아</option>
                <option value="unknown">모름</option>
              </Select>
            </Field>
            <Field label="크기">
              <Select className="pdi" style={INPUT_STYLE} value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="s">소형 (7kg 이하)</option>
                <option value="m">중형 (7–15kg)</option>
                <option value="l">대형 (15kg 이상)</option>
              </Select>
            </Field>
          </div>

          <SectionLabel>성격 · 특징</SectionLabel>
          <Field label="한 줄 소개">
            <Textarea className="pdi" style={AREA_STYLE} value={petAbout} onChange={(e) => setPetAbout(e.target.value)} placeholder="우리 아이를 소개해 주세요" />
          </Field>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {TEMPERAMENTS.map((tp) => (
              <Chip key={tp.v} active={temper.includes(tp.v)} onClick={() => toggle(temper, setTemper, tp.v)}>
                {tp.label}
              </Chip>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <Button variant="secondary" icon="back" onClick={() => setStep(1)} disabled={busy}>
              이전
            </Button>
            <Button onClick={submit2} loading={busy} icon="check">
              완료
            </Button>
          </div>
        </section>
      )}
    </Page>
  );
}
