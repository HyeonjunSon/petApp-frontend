"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Pet, PetPhoto, PetType, Sex, Size } from "@/types/pet";
import { Card, Button, Field, Input, Select, Textarea, Badge, Banner, cx } from "@/components/ui";

const cdnThumb = (url: string, w = 300, h = 300) =>
  url?.includes("/upload/") ? url.replace("/upload/", `/upload/c_fill,w_${w},h_${h}/`) : url;
const bust = (url: string, v: number) => (!url ? url : url.includes("?") ? `${url}&v=${v}` : `${url}?v=${v}`);

const TEMPER_OPTIONS = ["Friendly", "Energetic", "Calm", "Sociable", "In training", "Loves walks", "Playful", "Cat-friendly", "Dog-friendly"];
const PHOTO_TYPE_RE = /^image\/(png|jpe?g|webp|gif|bmp|svg\+xml)$/;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [ver, setVer] = useState(0);

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [type, setType] = useState<PetType>("dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [sex, setSex] = useState<Sex>("unknown");
  const [size, setSize] = useState<Size>("m");
  const [temperament, setTemperament] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await api.get<Pet[]>("/pets");
    setPets(data || []);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const toggleTemper = (t: string) =>
    setTemperament((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : prev.length >= 5 ? prev : [...prev, t]));

  const resetForm = () => {
    setName(""); setAbout(""); setBreed(""); setAge("");
    setSex("unknown"); setSize("m"); setType("dog"); setTemperament([]); setError("");
  };

  const create = async () => {
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true); setError("");
    try {
      await api.post("/pets", {
        name: name.trim(),
        type,
        breed: breed.trim() || undefined,
        age: typeof age === "number" ? age : undefined,
        sex,
        size,
        temperament,
        about: about.trim(),
      });
      resetForm();
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to create");
    } finally { setSaving(false); }
  };

  // Inline edit for pet bio (about)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAbout, setDraftAbout] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const startEdit = (p: Pet) => {
    setEditingId(p._id);
    setDraftAbout((p.about ?? p.bio) ?? "");
  };
  const cancelEdit = () => { setEditingId(null); setDraftAbout(""); };
  const saveEdit = async (p: Pet) => {
    setSavingEdit(true);
    try {
      const { data } = await api.put<Pet>(`/pets/${p._id}`, { about: draftAbout.trim() });
      setPets((prev) => prev.map((x) => (x._id === p._id ? data : x)));
      setEditingId(null);
      setDraftAbout("");
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to update");
    } finally {
      setSavingEdit(false);
    }
  };

  const remove = async (p: Pet) => {
    if (!confirm(`Delete ${p.name}? Photos will be removed too.`)) return;
    try {
      await api.delete(`/pets/${p._id}`);
      setPets((prev) => prev.filter((x) => x._id !== p._id));
    } catch (e: any) { alert(e?.response?.data?.message || "Failed to delete"); }
  };

  const uploadPhoto = async (petId: string, file?: File) => {
    if (!file) return;
    if (!PHOTO_TYPE_RE.test(file.type)) return alert("Only image files are allowed.");
    if (file.size > MAX_PHOTO_BYTES) return alert("Max file size is 10MB.");
    const fd = new FormData();
    fd.append("photo", file);
    try {
      const { data } = await api.post<{ ok: boolean; photo: PetPhoto; pet: Pet }>(`/pets/${petId}/photo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPets((prev) => prev.map((x) => (x._id === petId ? data.pet : x)));
      setVer((v) => v + 1);
    } catch (e: any) { alert(e?.response?.data?.message || "Upload failed"); }
  };

  const removePhoto = async (petId: string, publicId?: string) => {
    if (!publicId) return alert("This photo has no publicId and can't be deleted.");
    if (!confirm("Delete this photo?")) return;
    const encoded = publicId.split("/").map(encodeURIComponent).join("/");
    try {
      const { data } = await api.delete<{ ok: boolean; pet: Pet }>(`/pets/${petId}/photo/${encoded}`);
      setPets((prev) => prev.map((x) => (x._id === petId ? data.pet : x)));
      setVer((v) => v + 1);
    } catch (e: any) { alert(e?.response?.data?.message || "Failed to delete photo"); }
  };

  const canSave = useMemo(() => !!name.trim() && !saving, [name, saving]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Pets</h1>
        <p className="mt-1 text-sm text-slate-500">Add just the essentials needed for matching.</p>
      </div>

      {/* Create form */}
      <Card>
        <div className="grid grid-cols-12 gap-4">
          <Field label="Name" required className="col-span-12 md:col-span-4">
            <Input placeholder="e.g. Mango" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Species" className="col-span-6 md:col-span-4">
            <Select value={type} onChange={(e) => setType(e.target.value as PetType)}>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="Breed" className="col-span-6 md:col-span-4">
            <Input placeholder="e.g. Ragdoll / Shiba" value={breed} maxLength={32} onChange={(e) => setBreed(e.target.value)} />
          </Field>
          <Field label="Age (years)" className="col-span-6 md:col-span-3">
            <Input type="number" min={0} max={60} placeholder="e.g. 2" value={age}
              onChange={(e) => setAge(e.target.value === "" ? "" : Math.max(0, Math.min(60, Number(e.target.value))))} />
          </Field>
          <Field label="Sex" className="col-span-6 md:col-span-3">
            <Select value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </Select>
          </Field>
          <Field label="Size" className="col-span-6 md:col-span-3">
            <Select value={size} onChange={(e) => setSize(e.target.value as Size)}>
              <option value="s">Small</option>
              <option value="m">Medium</option>
              <option value="l">Large</option>
            </Select>
          </Field>
          <Field label="Bio" className="col-span-12 md:col-span-9">
            <Input placeholder="e.g. Loves walks and gets along with people and dogs" value={about} maxLength={200} onChange={(e) => setAbout(e.target.value)} />
          </Field>
          <div className="col-span-12">
            <div className="mb-1.5 text-sm font-medium text-slate-700">Personality tags <span className="text-xs font-normal text-slate-500">(up to 5 · {temperament.length}/5)</span></div>
            <div className="flex flex-wrap gap-2">
              {TEMPER_OPTIONS.map((t) => {
                const on = temperament.includes(t);
                const disabled = !on && temperament.length >= 5;
                return (
                  <button key={t} type="button" onClick={() => toggleTemper(t)} disabled={disabled}
                    className={cx(
                      "rounded-full px-3 py-1.5 text-sm transition",
                      on ? "bg-brand-600 text-white hover:bg-brand-700"
                        : disabled ? "border border-slate-200 bg-slate-50 text-slate-400"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    )}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && <div className="mt-3"><Banner tone="rose">{error}</Banner></div>}

        <div className="mt-4 flex justify-end">
          <Button onClick={create} disabled={!canSave} loading={saving}>Add pet</Button>
        </div>
      </Card>

      {/* List */}
      {!pets.length ? (
        <Banner tone="amber">🐾 No pets yet. Add one using the form above.</Banner>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {pets.map((p) => (
            <div key={p._id} className="col-span-12 md:col-span-6 xl:col-span-4">
              <Card padded={false} className="flex h-full flex-col">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                      {(p.name || "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold">{p.name}</h3>
                        <Badge>{labelType(p.type)}</Badge>
                      </div>
                      <div className="mt-1 truncate text-xs text-slate-500">
                        {p.breed || "Unknown breed"} · {labelSize(p.size)} · {labelSex(p.sex)}{p.age != null ? ` · ${p.age}y` : ""}
                      </div>
                      {!!p.temperament?.length && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.temperament.slice(0, 5).map((t, i) => (
                            <span key={i} className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-700">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {editingId === p._id ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        rows={3}
                        value={draftAbout}
                        onChange={(e) => setDraftAbout(e.target.value)}
                        maxLength={200}
                        placeholder="Tell others about this pet"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={cancelEdit}>Cancel</Button>
                        <Button size="sm" onClick={() => saveEdit(p)} loading={savingEdit}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    (p.about || p.bio) && <p className="mt-3 text-sm text-slate-700">{p.about || p.bio}</p>
                  )}

                  <div className="mt-3">
                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                      Upload photo
                      <input type="file" accept="image/*" hidden onChange={(e) => { uploadPhoto(p._id, e.target.files?.[0]); e.currentTarget.value = ""; }} />
                    </label>
                  </div>

                  {!!p.photos?.length && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {p.photos.slice(0, 6).map((ph, idx) => (
                        <div key={ph._id || ph.publicId || idx} className="group relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={bust(cdnThumb(ph.url, 300, 300), ver)}
                            alt={`${p.name} ${idx + 1}`}
                            className="h-24 w-full rounded-lg border border-slate-200 object-cover"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (img.dataset.fb === "1") return;
                              img.dataset.fb = "1";
                              img.src = "/img/pet-placeholder.svg";
                            }}
                          />
                          <button type="button" onClick={() => removePhoto(p._id, ph.publicId)}
                            className="absolute right-1 top-1 hidden rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] text-white group-hover:block">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-5 py-3">
                  <Button variant="secondary" size="sm" onClick={() => startEdit(p)} disabled={editingId === p._id}>Edit bio</Button>
                  <Button variant="danger" size="sm" onClick={() => remove(p)}>Delete</Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function labelType(s?: string) { return s === "dog" ? "Dog" : s === "cat" ? "Cat" : "Other"; }
function labelSex(s?: string) { return s === "male" ? "Male" : s === "female" ? "Female" : "Unknown"; }
function labelSize(s?: string) { return s === "s" ? "Small" : s === "l" ? "Large" : "Medium"; }
