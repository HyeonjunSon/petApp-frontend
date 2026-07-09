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
  "Something went wrong.";

const PURPOSES = ["Socializing", "Exercise & health", "Pup socialization", "Regular walk partner", "One-time walk"];
const TEMPERAMENTS = ["Energetic", "Gentle", "Shy", "Friendly", "Independent"];

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
            Owner details
          </h1>
          <p style={{ margin: "6px 0 18px", fontSize: 14, color: "var(--ink-soft)" }}>
            Tell us a bit about yourself so we can match you for walks with your pet.
          </p>

          <SectionLabel>Basic info</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="Birth year" className="flex-1" >
                <Input value={birthYear} onChange={(e) => setBirthYear(e.target.value)} inputMode="numeric" placeholder="1995" />
              </Field>
              <Field label="Gender">
                <Select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: 120 }}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="undisclosed">Undisclosed</option>
                </Select>
              </Field>
            </div>
            <Field label="Location">
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Mapo-gu, Seoul" />
            </Field>
            <Field label="Short bio">
              <Textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Short bio" />
            </Field>
          </div>

          <SectionLabel>Contact</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Phone">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
            </Field>
            <Field label="Email">
              <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" />
            </Field>
          </div>

          <SectionLabel>Walk goals</SectionLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PURPOSES.map((p) => (
              <Chip key={p} active={purposes.includes(p)} onClick={() => toggle(purposes, setPurposes, p)}>
                {p}
              </Chip>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <Button onClick={submit1} loading={busy} icon="fwd">
              Next — Create pet profile
            </Button>
          </div>
        </UICard>
      ) : (
        <UICard>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>
            Create pet profile
          </h1>
          <p style={{ margin: "6px 0 18px", fontSize: 14, color: "var(--ink-soft)" }}>
            Introduce your beloved pet
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
            <ImagePlaceholder src={petPreview || undefined} label="Pet photo preview" height={180} />
          </button>

          <SectionLabel>Basic info</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Pet name">
              <Input value={petName} onChange={(e) => setPetName(e.target.value)} />
            </Field>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="Breed" className="flex-1">
                <Input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Pomeranian" />
              </Field>
              <Field label="Age (years)">
                <Input value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" style={{ width: 120 }} />
              </Field>
            </div>
            <Field label="Sex">
              <Select value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </Select>
            </Field>
            <Field label="Size">
              <Select value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="s">Small (up to 7kg)</option>
                <option value="m">Medium (7–15kg)</option>
                <option value="l">Large (15kg and up)</option>
              </Select>
            </Field>
          </div>

          <SectionLabel>Personality & traits</SectionLabel>
          <Field label="Short bio">
            <Textarea value={petAbout} onChange={(e) => setPetAbout(e.target.value)} placeholder="Short bio" />
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
              Back
            </Button>
            <Button onClick={submit2} loading={busy} icon="check">
              Done
            </Button>
          </div>
        </UICard>
      )}
    </Page>
  );
}
