"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, Button, Field, Input, Select, Textarea, Banner } from "@/components/ui";

type Pet = { _id: string; name: string };

export default function NewWalkPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState("");
  const [distanceKm, setDistanceKm] = useState<number | "">(1.2);
  const [durationMin, setDurationMin] = useState<number | "">(20);
  const [startedAt, setStartedAt] = useState(new Date().toISOString().slice(0, 16));
  const [endedAt, setEndedAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Pet[]>("/pets");
        setPets(data || []);
        if (data?.[0]?._id) setPetId(data[0]._id);
      } catch (e: any) {
        setMsg(e?.response?.data?.message || "Failed to load pets");
      }
    })();
  }, []);

  const validate = () => {
    if (!petId) return "Please select a pet.";
    const d = Number(distanceKm), m = Number(durationMin);
    if (isNaN(d) || d <= 0) return "Distance must be greater than 0.";
    if (isNaN(m) || m <= 0) return "Time (min) must be greater than 0.";
    if (new Date(endedAt) < new Date(startedAt)) return "End time can't be before start time.";
    return "";
  };

  const submit = async () => {
    const v = validate();
    if (v) { setMsg(v); setOk(false); return; }
    try {
      setLoading(true);
      setMsg("");
      await api.post("/walks", {
        petId,
        distanceKm: Number(distanceKm),
        durationMin: Number(durationMin),
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        notes,
      });
      setOk(true);
      setMsg("Saved ✓");
    } catch (e: any) {
      setOk(false);
      setMsg(e?.response?.data?.message || "Error while saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[640px] space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/walks" className="text-sm text-slate-500 hover:text-slate-800">← Walks</Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add a walk</h1>
        <p className="mt-1 text-sm text-slate-500">Just enter distance and time!</p>
      </div>

      <Card>
        <div className="space-y-5">
          <Field label="Pet" required>
            <Select value={petId} onChange={(e) => setPetId(e.target.value)}>
              {pets.length === 0 && <option value="">No pets</option>}
              {pets.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Distance (km)">
              <Input type="number" step="0.1" min={0} value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value === "" ? "" : Number(e.target.value))} />
            </Field>
            <Field label="Time (min)">
              <Input type="number" min={0} value={durationMin}
                onChange={(e) => setDurationMin(e.target.value === "" ? "" : Number(e.target.value))} />
            </Field>
            <Field label="Start">
              <Input type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
            </Field>
            <Field label="End">
              <Input type="datetime-local" value={endedAt} min={startedAt} onChange={(e) => setEndedAt(e.target.value)} />
            </Field>
          </div>

          <Field label="Notes">
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How was the walk today?" />
          </Field>

          {!!msg && <Banner tone={ok ? "brand" : "rose"}>{msg}</Banner>}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => router.push("/walks")}>Back to list</Button>
            <Button onClick={submit} loading={loading} disabled={!petId}>Save</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
