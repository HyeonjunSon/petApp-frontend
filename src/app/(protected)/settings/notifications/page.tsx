"use client";

/** 알림 설정. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Button, Switch, Banner, Toast, type ToastData } from "@/components/ui";

const PUSH = [
  ["match", "새 매칭 추천"],
  ["invite", "산책 약속 초대"],
  ["inviteStatus", "산책 약속 상태 변경"],
  ["message", "새 메시지"],
  ["follow", "새 팔로워"],
];
const EMAIL = [
  ["weekly", "주간 매칭 요약"],
  ["newMessage", "새 메시지"],
  ["walkAlert", "산책 약속 알림"],
  ["profileView", "프로필 조회 알림"],
];
const ETC = [
  ["serviceUpdate", "서비스 업데이트"],
  ["events", "이벤트 · 혜택"],
  ["marketing", "마케팅 메일"],
];

function SectionTitle({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <h2 style={{ margin: first ? "0 0 12px" : "28px 0 12px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>
      {children}
    </h2>
  );
}

function Group({
  title,
  items,
  state,
  setState,
}: {
  title: string;
  items: string[][];
  state: Record<string, boolean>;
  setState: (k: string, v: boolean) => void;
}) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="pd-card" style={{ padding: "6px 16px" }}>
        {items.map(([k, label], i) => (
          <div
            key={k}
            style={{
              padding: "13px 0",
              borderTop: i === 0 ? "none" : "0.5px solid var(--border)",
            }}
          >
            <Switch on={state[k] ?? true} onChange={(v) => setState(k, v)} label={label} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [master, setMaster] = useState(true);
  const [state, setStateMap] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData>(null);

  useEffect(() => {
    api.get("/settings").then(({ data }) => {
      if (typeof data?.push === "boolean") setMaster(data.push);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const setState = (k: string, v: boolean) => setStateMap((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.put("/settings", { push: master });
      setToast({ msg: "알림 설정이 저장되었어요", type: "ok" });
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="알림 설정" subtitle="받고 싶은 알림을 선택해요." maxWidth={680}>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <SectionTitle first>알림 수신 동의</SectionTitle>
      <div className="pd-card" style={{ padding: 16 }}>
        <Switch on={master} onChange={setMaster} label="모든 알림 받기" />
        <p style={{ margin: "8px 0 0", fontSize: "var(--fs-meta)", color: "var(--text-secondary)" }}>
          켜면 아래 알림을 모두 받을 수 있어요.
        </p>
      </div>

      <Group title="푸시 알림" items={PUSH} state={state} setState={setState} />
      <Group title="이메일 알림" items={EMAIL} state={state} setState={setState} />
      <Group title="기타" items={ETC} state={state} setState={setState} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
        <Button variant="secondary" onClick={() => router.push("/settings")}>취소</Button>
        <Button onClick={save} loading={busy} icon="check">저장</Button>
      </div>

      <Toast toast={toast} />
    </Page>
  );
}
