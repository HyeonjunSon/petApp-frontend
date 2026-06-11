"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import {
  Avatar, Badge, Button, Card, Chip, Field, Icon, Input, Select, Textarea, Toast, cx, type ToastData,
} from "@/components/ui";
import type { PetType, Sex, Size } from "@/types/pet";

type Goal = "Dating" | "Friends" | "Both";
const GOALS: Goal[] = ["Dating", "Friends", "Both"];

const INTERESTS = [
  "Walks", "Cafés", "Training", "Photos", "Grooming", "Camping", "Indoor play", "Socializing",
] as const;

const TEMPER_OPTIONS = [
  "Friendly", "Energetic", "Calm", "Sociable", "In training",
  "Loves walks", "Playful", "Cat-friendly", "Dog-friendly",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [toast, setToast] = useState<ToastData>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  // step 1
  const faceInput = useRef<HTMLInputElement | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [facePreview, setFacePreview] = useState<string>("");
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [goal, setGoal] = useState<Goal>("Friends");

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!faceFile) { setFacePreview(""); return; }
    const url = URL.createObjectURL(faceFile);
    setFacePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [faceFile]);

  // step 2
  const petPhotoInput = useRef<HTMLInputElement | null>(null);
  const [petFile, setPetFile] = useState<File | null>(null);
  const [petPreview, setPetPreview] = useState<string>("");
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState<PetType>("dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [sex, setSex] = useState<Sex>("unknown");
  const [size, setSize] = useState<Size>("m");
  const [temperament, setTemperament] = useState<string[]>([]);
  const [petAbout, setPetAbout] = useState("");

  useEffect(() => {
    if (!petFile) { setPetPreview(""); return; }
    const url = URL.createObjectURL(petFile);
    setPetPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [petFile]);

  // step 3
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (k: string) =>
    setInterests((p) => (p.includes(k) ? p.filter((v) => v !== k) : p.length >= 5 ? p : [...p, k]));

  const toggleTemper = (t: string) =>
    setTemperament((p) => (p.includes(t) ? p.filter((v) => v !== t) : p.length >= 5 ? p : [...p, t]));

  const finish = async () => {
    setBusy(true);
    try {
      // 1) save user info
      await api.put("/users/me", {
        ...(locationName ? { locationName } : {}),
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        goal,
        interests,
      });

      // 2) upload face photo
      if (faceFile) {
        const fd = new FormData();
        fd.append("photo", faceFile);
        fd.append("type", "owner_face");
        await api.post("/users/me/photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }

      // 3) create pet (if name provided)
      let createdPetId: string | null = null;
      if (petName.trim()) {
        const { data: pet } = await api.post("/pets", {
          name: petName.trim(),
          type: petType,
          breed: breed.trim() || undefined,
          age: typeof age === "number" ? age : undefined,
          sex,
          size,
          temperament,
          about: petAbout.trim(),
        });
        createdPetId = pet?._id || null;
      }

      // 4) upload pet photo to created pet
      if (createdPetId && petFile) {
        const fd = new FormData();
        fd.append("photo", petFile);
        await api.post(`/pets/${createdPetId}/photo`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 5) refresh me
      try {
        const { data: fresh } = await api.get("/users/me");
        setUser(fresh);
      } catch {}

      setToast({ msg: "All set!", type: "ok" });
      setTimeout(() => router.replace("/match"), 600);
    } catch (e: any) {
      setToast({ msg: e?.response?.data?.message || "Setup failed", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const canNext = useMemo(() => {
    if (step === 1) return true; // photo recommended but skippable; warn shown
    if (step === 2) return !!petName.trim();
    return true;
  }, [step, petName]);

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-subtle)", color: "var(--ink)" }}
    >
      {/* progress bar */}
      <div className="mx-auto w-full max-w-[640px] px-5 pt-5 sm:px-8">
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--ink-soft)" }}>
          <span>Step {step} / 3</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%`, background: "var(--brand)" }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-[640px] px-5 pb-24 pt-6 sm:px-8">
        {step === 1 && (
          <Card>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--ink)" }}>About you</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
              Your face photo is required to be discovered.
            </p>

            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => faceInput.current?.click()}
                style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", position: "relative" }}
              >
                <Avatar src={facePreview} size={120} />
                <span
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    background: "var(--brand)",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    boxShadow: "0 0 0 3px var(--bg)",
                  }}
                >
                  <Icon name="camera" size={18} />
                </span>
              </button>
              <input
                ref={faceInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFaceFile(e.target.files?.[0] || null)}
              />
              {!faceFile && (
                <p className="text-xs" style={{ color: "var(--warning)" }}>
                  Without a face photo, your card won&apos;t be shown to others.
                </p>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <Field label="Neighborhood (optional)" hint="e.g. Yeonnam-dong">
                <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Where you usually walk" />
              </Field>
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                className="text-sm font-semibold disabled:opacity-60"
                style={{ color: "var(--brand-strong)" }}
              >
                {locating ? "Locating…" : coords ? "📍 Location set ✓" : "📍 Use my current location"}
              </button>

              <div>
                <div className="mb-2 text-sm font-medium">Goal</div>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <Chip key={g} active={goal === g} onClick={() => setGoal(g)}>{g}</Chip>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--ink)" }}>Your pet</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
              The essentials to start matching.
            </p>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => petPhotoInput.current?.click()}
                aria-label="Choose pet photo"
                style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", position: "relative" }}
              >
                <div
                  className="overflow-hidden"
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 18,
                    background: "var(--surface-2)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {petPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={petPreview} alt="pet" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Icon name="camera" size={36} color="var(--ink-faint)" />
                  )}
                </div>
              </button>
              <input
                ref={petPhotoInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPetFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Field label="Name" required className="col-span-2">
                <Input value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="e.g. Mango" maxLength={24} />
              </Field>
              <Field label="Species">
                <Select value={petType} onChange={(e) => setPetType(e.target.value as PetType)}>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
              <Field label="Breed">
                <Input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="e.g. Shiba" />
              </Field>
              <Field label="Age (years)">
                <Input type="number" min={0} max={60} value={age} onChange={(e) => setAge(e.target.value === "" ? "" : Math.max(0, Math.min(60, Number(e.target.value))))} />
              </Field>
              <Field label="Sex">
                <Select value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unknown">Unknown</option>
                </Select>
              </Field>
              <Field label="Size" className="col-span-2">
                <Select value={size} onChange={(e) => setSize(e.target.value as Size)}>
                  <option value="s">Small</option>
                  <option value="m">Medium</option>
                  <option value="l">Large</option>
                </Select>
              </Field>
              <Field label="Bio" className="col-span-2">
                <Textarea rows={3} value={petAbout} onChange={(e) => setPetAbout(e.target.value)} placeholder="e.g. Loves walks and meeting new friends" maxLength={200} />
              </Field>
              <div className="col-span-2">
                <div className="mb-2 text-sm font-medium">Personality <span className="text-xs font-normal" style={{ color: "var(--ink-soft)" }}>(up to 5)</span></div>
                <div className="flex flex-wrap gap-2">
                  {TEMPER_OPTIONS.map((t) => (
                    <Chip key={t} active={temperament.includes(t)} onClick={() => toggleTemper(t)}>{t}</Chip>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--ink)" }}>Your interests</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
              Pick up to 5 — we&apos;ll use these to match you with similar folks.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {INTERESTS.map((k) => (
                <Chip key={k} active={interests.includes(k)} onClick={() => toggleInterest(k)}>
                  {k}
                </Chip>
              ))}
            </div>
            <div className="mt-2 text-xs" style={{ color: "var(--ink-soft)" }}>
              {interests.length}/5 selected
            </div>
          </Card>
        )}

        {/* Sticky footer with actions */}
        <div className="mt-6 flex items-center gap-3">
          {step > 1 ? (
            <Button variant="secondary" fullWidth onClick={() => setStep((s) => (s - 1) as any)}>
              Back
            </Button>
          ) : (
            <Button variant="ghost" fullWidth onClick={() => router.replace("/match")}>
              Skip for now
            </Button>
          )}
          {step < 3 ? (
            <Button fullWidth onClick={() => setStep((s) => (s + 1) as any)} disabled={!canNext}>
              Continue
            </Button>
          ) : (
            <Button fullWidth onClick={finish} loading={busy}>
              Start matching
            </Button>
          )}
        </div>
      </div>

      <Toast toast={toast} />
    </main>
  );
}
