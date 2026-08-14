"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Banner, Button, Field, Input, Sheet } from "@/components/ui";

const INPUT_STYLE: React.CSSProperties = {
  border: "none",
  background: "var(--input-bg)",
  borderRadius: 10,
  height: 46,
};

export default function PasswordSheet({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setErr(null);
  };
  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    setErr(null);
    if (next !== confirm) return setErr("새 비밀번호가 서로 일치하지 않아요.");
    if (next.length < 8) return setErr("비밀번호는 8자 이상이어야 해요.");
    setBusy(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: current,
        newPassword: next,
      });
      reset();
      onDone();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "비밀번호를 변경하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={close} title="비밀번호 변경">
      <div className="flex flex-col gap-3 px-5 pt-2 pb-6">
        <style>{`.pdi:focus{box-shadow:0 0 0 2px var(--primary)}`}</style>
        {err && <Banner tone="rose">{err}</Banner>}
        <Field label="현재 비밀번호" required>
          <Input
            className="pdi"
            style={INPUT_STYLE}
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </Field>
        <Field label="새 비밀번호" required hint="8자 이상 입력해 주세요.">
          <Input
            className="pdi"
            style={INPUT_STYLE}
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </Field>
        <Field label="새 비밀번호 확인" required>
          <Input
            className="pdi"
            style={INPUT_STYLE}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <div className="mt-1 flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>
            취소
          </Button>
          <Button
            loading={busy}
            disabled={!current || !next || !confirm}
            onClick={submit}
          >
            변경하기
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
