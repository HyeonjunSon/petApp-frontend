"use client";

/** 프로필 / 설정 — settings hub. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Card as UICard, Button, Avatar, Sheet, Field, Input, Banner } from "@/components/ui";

function Row({
  avatar,
  title,
  desc,
  action,
}: {
  avatar?: React.ReactNode;
  title: string;
  desc: string;
  action: React.ReactNode;
}) {
  return (
    <UICard>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {avatar}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{title}</div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>{desc}</div>
        </div>
        {action}
      </div>
    </UICard>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

export default function SettingsHubPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();
  const [pwOpen, setPwOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const face =
    (user as any)?.faceUrl ||
    (user?.photos || []).find((p) => p.type === "owner_face")?.url;

  return (
    <Page title="프로필 / 설정" maxWidth={900}>
      <Section title="펫 프로필">
        <Row
          avatar={<Avatar fallbackText="펫" size={44} />}
          title="내 반려동물 프로필"
          desc="사진, 성격, 산책 스타일 수정"
          action={<Button onClick={() => router.push("/settings/pet")}>수정하기</Button>}
        />
      </Section>

      <Section title="소유자 프로필">
        <Row
          avatar={<Avatar src={face} fallbackText={(user?.name || "나")[0]} size={44} />}
          title="내 프로필"
          desc="닉네임, 소개, 사진 수정"
          action={<Button onClick={() => router.push("/settings/profile")}>수정하기</Button>}
        />
      </Section>

      <Section title="서비스 설정">
        <Row
          title="노출 / 필터 설정"
          desc="탐색 반경, 견종, 나이 필터 관리"
          action={<Button variant="secondary" onClick={() => router.push("/settings/exposure")}>설정</Button>}
        />
        <Row
          title="알림 설정"
          desc="매칭, 채팅, 산책 알림 관리"
          action={<Button variant="secondary" onClick={() => router.push("/settings/notifications")}>설정</Button>}
        />
      </Section>

      <Section title="구독">
        <Row
          title="프리미엄 구독"
          desc="무제한 매칭·슈퍼 라이크·프리미엄 필터 이용"
          action={<Button variant="secondary" onClick={() => router.push("/subscription/billing")}>구독 관리</Button>}
        />
      </Section>

      <Section title="계정">
        <Row
          title="비밀번호 변경"
          desc="로그인 비밀번호를 변경합니다"
          action={<Button variant="secondary" onClick={() => setPwOpen(true)}>변경</Button>}
        />
        <Row
          title="계정"
          desc="로그아웃 또는 계정 삭제"
          action={
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                variant="secondary"
                onClick={async () => {
                  try { await api.post("/auth/logout"); } catch {}
                  logout();
                  setUser(null);
                  router.replace("/login");
                }}
              >
                로그아웃
              </Button>
              <Button variant="dangerGhost" onClick={() => setDelOpen(true)}>계정 삭제</Button>
            </div>
          }
        />
      </Section>

      <PasswordSheet open={pwOpen} onClose={() => setPwOpen(false)} />
      <DeleteSheet
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onDeleted={() => {
          logout();
          setUser(null);
          router.replace("/login");
        }}
      />
    </Page>
  );
}

function PasswordSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const submit = async () => {
    setErr(null);
    if (next.length < 6) return setErr("새 비밀번호는 6자 이상이어야 해요.");
    setBusy(true);
    try {
      await api.post("/auth/change-password", { currentPassword: cur, newPassword: next });
      setOk(true);
      setCur(""); setNext("");
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "변경하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="비밀번호 변경" desktop>
      <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {err && <Banner tone="rose">{err}</Banner>}
        {ok && <Banner tone="brand">비밀번호가 변경됐어요.</Banner>}
        <Field label="현재 비밀번호"><Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
        <Field label="새 비밀번호" hint="6자 이상"><Input type="password" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
        <Button fullWidth size="lg" loading={busy} onClick={submit}>변경</Button>
      </div>
    </Sheet>
  );
}

function DeleteSheet({ open, onClose, onDeleted }: { open: boolean; onClose: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try { await api.delete("/account"); onDeleted(); } catch {} finally { setBusy(false); }
  };
  return (
    <Sheet open={open} onClose={onClose} title="계정 삭제" desktop>
      <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)" }}>
          계정과 모든 데이터가 영구 삭제됩니다. 되돌릴 수 없어요.
        </p>
        <Button variant="danger" fullWidth size="lg" loading={busy} onClick={submit}>
          영구 삭제
        </Button>
      </div>
    </Sheet>
  );
}
