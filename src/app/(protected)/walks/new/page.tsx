"use client";

/** New plan — create a walk-invite with a matched partner. */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/store/auth";
import { useMatchesQuery, useCreateInviteMutation } from "@/store/api";
import { Page } from "@/components/shell/Page";
import { Input, Textarea, Select, Field, Banner, Spinner } from "@/components/ui";
import { type Match, peerOf, pickPet } from "../../chat/types";

// Leaflet은 window를 만지므로 SSR 제외
const WalkMap = dynamic(() => import("@/components/WalkMap"), { ssr: false });

/* v2 인풋: --paper 배경 + radius 12 (보더는 공용 컴포넌트의 --line 그대로) */
const inputBg: React.CSSProperties = { background: "var(--paper)" };

export default function NewWalkInvitePage() {
  const router = useRouter();
  const { user } = useAuth();
  const myId = (user as any)?._id || "";

  const { data: matches = [] } = useMatchesQuery();
  const [createInvite] = useCreateInviteMutation();
  const [matchId, setMatchId] = useState("");
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [address, setAddress] = useState("");
  const [duration, setDuration] = useState("");
  const [maxPeople, setMaxPeople] = useState("2");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [petCond, setPetCond] = useState("any");
  const [approval, setApproval] = useState("auto");
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId && matches[0]) setMatchId(matches[0]._id);
  }, [matches, matchId]);

  const submit = async () => {
    setErr(null);
    if (!matchId) return setErr("Please choose a partner. You need a match first.");
    if (!date || !time) return setErr("Please enter a date and start time.");
    setBusy(true);
    try {
      const noteParts = [
        title && `Title: ${title}`,
        address && `Meeting point: ${address}`,
        duration && `About ${duration} min`,
        petCond !== "any" &&
          `Condition: ${petCond === "small" ? "Small dogs only" : petCond === "medium" ? "Medium dogs only" : "Large dogs only"}`,
        `Up to ${maxPeople} people · ${approval === "auto" ? "Auto-accept" : "Manual approval"}`,
      ].filter(Boolean);
      await createInvite({
        matchId,
        date,
        time,
        place: place || undefined,
        location: picked || undefined,
        note: noteParts.join(" · ") || undefined,
      }).unwrap(); // Invites 태그 무효화 → /walks 목록·홈 배너 자동 갱신
      router.replace("/walks");
    } catch (e: any) {
      setErr(e?.data?.msg || e?.data?.message || "Couldn't create the plan.");
    } finally {
      setBusy(false);
    }
  };

  const partnerLabel = (m: Match) => {
    const peer = peerOf(m, myId);
    const pet = pickPet(peer);
    return `${pet?.name || "Friend"} · ${peer?.name || "Owner"}`;
  };

  return (
    <Page title="New plan" subtitle="Set up a new walk with a friend.">
      {err && <Banner tone="rose">{err}</Banner>}

      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 880 }}>
        <div className="card">
          <h2 style={{ fontSize: 18, margin: "0 0 14px" }}>Basic info</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Partner" required>
              {matches.length === 0 ? (
                <p style={{ fontSize: 14, color: "var(--fence)", margin: 0 }}>
                  No matches yet. Make a friend in Discover first.
                </p>
              ) : (
                <Select value={matchId} onChange={(e) => setMatchId(e.target.value)} style={inputBg}>
                  {matches.map((m) => (
                    <option key={m._id} value={m._id}>{partnerLabel(m)}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekend morning walk" style={inputBg} />
            </Field>
            <Field label="Place">
              <Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Withrow Park" style={inputBg} />
            </Field>
            <Field label="Address · Meeting point">
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter an address or meeting point" style={inputBg} />
            </Field>
            <Field label="Pin the meeting point on the map">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <WalkMap height={220} picked={picked} onPick={setPicked} />
                <span style={{ fontSize: 13, color: "var(--fence)" }}>
                  {picked
                    ? `Pinned ✓ (${picked.lat.toFixed(4)}, ${picked.lng.toFixed(4)}) — tap the map to move it`
                    : "Tap the map to drop a pin — it shows up on everyone's Walks map."}
                </span>
              </div>
            </Field>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="Estimated duration (min)">
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} inputMode="numeric" style={{ ...inputBg, width: 140 }} />
              </Field>
              <Field label="Max people">
                <Select value={maxPeople} onChange={(e) => setMaxPeople(e.target.value)} style={{ ...inputBg, width: 110 }}>
                  {["2", "3", "4", "5"].map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </Field>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 18, margin: "0 0 14px" }}>Schedule</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Date" required>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputBg, width: 180 }} />
            </Field>
            <Field label="Start time" required>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ ...inputBg, width: 180 }} />
            </Field>
          </div>
          <Field label="Pet condition" className="mt-4">
            <Select value={petCond} onChange={(e) => setPetCond(e.target.value)} style={inputBg}>
              <option value="any">Any</option>
              <option value="small">Small dogs only</option>
              <option value="medium">Medium dogs only</option>
              <option value="large">Large dogs only</option>
            </Select>
          </Field>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 18, margin: "0 0 14px" }}>Participation</h2>
          <Field label="Approval">
            <Select value={approval} onChange={(e) => setApproval(e.target.value)} style={inputBg}>
              <option value="auto">Auto-accept</option>
              <option value="manual">Manual approval</option>
            </Select>
          </Field>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="btn btn-ghost" onClick={() => router.push("/walks")}>
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            onClick={submit}
            disabled={busy || matches.length === 0}
          >
            {busy && <Spinner />}
            Create plan
          </button>
        </div>
      </div>
    </Page>
  );
}
