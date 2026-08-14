"use client";

/** New plan — create a walk-invite with a matched partner. */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Button, Input, Textarea, Select, Field, Banner } from "@/components/ui";
import { type Match, peerOf, pickPet } from "../../chat/types";

/* 시안 카드: surface + radius-2xl + shadow-card, 보더 없음 */
const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: "var(--radius-2xl)",
  boxShadow: "var(--shadow-card)",
  padding: 20,
};
const cardTitleStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "var(--fs-h3)",
  fontWeight: 800,
  color: "var(--text)",
};

export default function NewWalkInvitePage() {
  const router = useRouter();
  const { user } = useAuth();
  const myId = (user as any)?._id || "";

  const [matches, setMatches] = useState<Match[]>([]);
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
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Match[]>("/matches")
      .then(({ data }) => {
        setMatches(data || []);
        if (data?.[0]) setMatchId(data[0]._id);
      })
      .catch(() => {});
  }, []);

  const submit = async () => {
    setErr(null);
    if (!matchId) return setErr("파트너를 선택해 주세요. 먼저 매치가 필요해요.");
    if (!date || !time) return setErr("날짜와 시작 시간을 입력해 주세요.");
    setBusy(true);
    try {
      const noteParts = [
        title && `제목: ${title}`,
        address && `만날 장소: ${address}`,
        duration && `약 ${duration}분`,
        petCond !== "any" &&
          `조건: ${petCond === "small" ? "소형견만" : petCond === "medium" ? "중형견만" : "대형견만"}`,
        `최대 ${maxPeople}명 · ${approval === "auto" ? "자동 수락" : "직접 승인"}`,
      ].filter(Boolean);
      await api.post(`/matches/${matchId}/walk-invite`, {
        date,
        time,
        place: place || undefined,
        note: noteParts.join(" · ") || undefined,
      });
      router.replace("/walks");
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "약속을 만들지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  const partnerLabel = (m: Match) => {
    const peer = peerOf(m, myId);
    const pet = pickPet(peer);
    return `${pet?.name || "친구"} · ${peer?.name || "보호자"}`;
  };

  return (
    <Page title="약속 만들기" subtitle="산책 친구와 새 약속을 잡아요." maxWidth={880}>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>기본 정보</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="파트너" required>
              {matches.length === 0 ? (
                <p style={{ fontSize: "var(--fs-meta)", color: "var(--text-secondary)", margin: 0 }}>
                  아직 매치가 없어요. 디스커버에서 먼저 친구를 만들어 주세요.
                </p>
              ) : (
                <Select value={matchId} onChange={(e) => setMatchId(e.target.value)}>
                  {matches.map((m) => (
                    <option key={m._id} value={m._id}>{partnerLabel(m)}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="제목">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="주말 아침 산책" />
            </Field>
            <Field label="장소">
              <Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="서울숲" />
            </Field>
            <Field label="주소 · 만날 지점">
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="주소나 만날 지점을 적어 주세요" />
            </Field>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="예상 소요 시간(분)">
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} inputMode="numeric" style={{ width: 140 }} />
              </Field>
              <Field label="최대 인원">
                <Select value={maxPeople} onChange={(e) => setMaxPeople(e.target.value)} style={{ width: 110 }}>
                  {["2", "3", "4", "5"].map((n) => <option key={n} value={n}>{n}명</option>)}
                </Select>
              </Field>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>일정</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="날짜" required>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 180 }} />
            </Field>
            <Field label="시작 시간" required>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: 180 }} />
            </Field>
          </div>
          <Field label="펫 조건" className="mt-4">
            <Select value={petCond} onChange={(e) => setPetCond(e.target.value)}>
              <option value="any">제한 없음</option>
              <option value="small">소형견만</option>
              <option value="medium">중형견만</option>
              <option value="large">대형견만</option>
            </Select>
          </Field>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>참여</h2>
          <Field label="승인 방식">
            <Select value={approval} onChange={(e) => setApproval(e.target.value)}>
              <option value="auto">자동 수락</option>
              <option value="manual">직접 승인</option>
            </Select>
          </Field>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button variant="secondary" onClick={() => router.push("/walks")}>취소</Button>
          <Button onClick={submit} loading={busy} disabled={matches.length === 0}>
            약속 만들기
          </Button>
        </div>
      </div>
    </Page>
  );
}
