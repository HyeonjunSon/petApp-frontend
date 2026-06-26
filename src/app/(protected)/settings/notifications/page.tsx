"use client";

/** 알림 설정. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Button, Switch, Banner, Toast, type ToastData } from "@/components/ui";

const PUSH = [
  ["match", "새로운 매칭 제안"],
  ["invite", "산책약속 초대"],
  ["inviteStatus", "산책약속 상태 변화"],
  ["message", "메시지 수신"],
  ["follow", "팔로우 추가"],
];
const EMAIL = [
  ["weekly", "주간 매칭 요약"],
  ["newMessage", "새로운 메시지"],
  ["walkAlert", "산책약속 알림"],
  ["profileView", "프로필 조회 알림"],
];
const ETC = [
  ["serviceUpdate", "서비스 업데이트"],
  ["events", "이벤트 및 특별 제안"],
  ["marketing", "마케팅 이메일"],
];

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
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map(([k, label]) => (
          <Switch key={k} on={state[k] ?? true} onChange={(v) => setState(k, v)} label={label} />
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
      setToast({ msg: "알림 설정을 저장했어요", type: "ok" });
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="알림 설정" maxWidth={680}>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>알림 수신 동의</h2>
        <Switch on={master} onChange={setMaster} label="전체 알림 수신" />
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--ink-soft)" }}>
          활성화하면 아래의 모든 알림을 받습니다.
        </p>
      </div>

      <Group title="푸시 알림" items={PUSH} state={state} setState={setState} />
      <Group title="이메일 알림" items={EMAIL} state={state} setState={setState} />
      <Group title="기타" items={ETC} state={state} setState={setState} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Button variant="secondary" onClick={() => router.push("/settings")}>취소</Button>
        <Button onClick={save} loading={busy} icon="check">저장</Button>
      </div>

      <Toast toast={toast} />
    </Page>
  );
}
