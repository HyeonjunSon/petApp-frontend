"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page, ImagePlaceholder } from "@/components/shell/Page";
import {
  Card as UICard,
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
  "문제가 발생했어요.";

const PURPOSES = ["친목·사교", "운동·건강", "강아지 사회화", "정기 산책 파트너", "일회성 동행"];
const TEMPERAMENTS = ["활발해요", "온순해요", "낯가림 있어요", "친화적이에요", "독립적이에요"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, margin: "8px 0" }}>
      {children}
    </div>
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
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      {step === 1 ? (
        <UICard>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>
            소유자 정보 입력
          </h1>
          <p style={{ margin: "6px 0 18px", fontSize: 14, color: "var(--ink-soft)" }}>
            반려동물과 함께하는 산책 매칭을 위해 기본 정보를 입력해 주세요.
          </p>

          <SectionLabel>기본 정보</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="이름">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="출생연도" className="flex-1" >
                <Input value={birthYear} onChange={(e) => setBirthYear(e.target.value)} inputMode="numeric" placeholder="1995" />
              </Field>
              <Field label="성별">
                <Select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: 120 }}>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="undisclosed">비공개</option>
                </Select>
              </Field>
            </div>
            <Field label="거주 지역">
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="서울 마포구" />
            </Field>
            <Field label="한 줄 소개">
              <Textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="한 줄 소개" />
            </Field>
          </div>

          <SectionLabel>연락처</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="휴대폰 번호">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
            </Field>
            <Field label="이메일 주소">
              <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" />
            </Field>
          </div>

          <SectionLabel>산책 목적</SectionLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PURPOSES.map((p) => (
              <Chip key={p} active={purposes.includes(p)} onClick={() => toggle(purposes, setPurposes, p)}>
                {p}
              </Chip>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <Button onClick={submit1} loading={busy} icon="fwd">
              다음 — 펫 프로필 등록
            </Button>
          </div>
        </UICard>
      ) : (
        <UICard>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>
            반려동물 프로필 만들기
          </h1>
          <p style={{ margin: "6px 0 18px", fontSize: 14, color: "var(--ink-soft)" }}>
            소중한 반려동물을 소개해 주세요
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
            <ImagePlaceholder src={petPreview || undefined} label="펫 프로필 사진 미리보기" height={180} />
          </button>

          <SectionLabel>기본 정보</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="펫 이름">
              <Input value={petName} onChange={(e) => setPetName(e.target.value)} />
            </Field>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="견종 / 묘종" className="flex-1">
                <Input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="포메라니안" />
              </Field>
              <Field label="나이 (살)">
                <Input value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" style={{ width: 120 }} />
              </Field>
            </div>
            <Field label="성별">
              <Select value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">수컷</option>
                <option value="female">암컷</option>
                <option value="unknown">모름</option>
              </Select>
            </Field>
            <Field label="크기">
              <Select value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="s">소형 (7kg 이하)</option>
                <option value="m">중형 (7~15kg)</option>
                <option value="l">대형 (15kg 이상)</option>
              </Select>
            </Field>
          </div>

          <SectionLabel>성격 및 특성</SectionLabel>
          <Field label="한 줄 소개">
            <Textarea value={petAbout} onChange={(e) => setPetAbout(e.target.value)} placeholder="한 줄 소개" />
          </Field>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {TEMPERAMENTS.map((tp) => (
              <Chip key={tp} active={temper.includes(tp)} onClick={() => toggle(temper, setTemper, tp)}>
                {tp}
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
        </UICard>
      )}
    </Page>
  );
}
