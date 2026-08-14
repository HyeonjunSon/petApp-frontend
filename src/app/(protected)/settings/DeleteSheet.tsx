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

export default function DeleteSheet({
  open,
  onClose,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const close = () => {
    setConfirm("");
    setErr(null);
    onClose();
  };

  const submit = async () => {
    setErr(null);
    if (confirm !== "DELETE") return setErr("DELETE를 정확히 입력해 주세요.");
    setBusy(true);
    try {
      await api.delete("/account");
      onDeleted();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "탈퇴 처리에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={close} title="회원 탈퇴">
      <div className="flex flex-col gap-3 px-5 pt-2 pb-6">
        <style>{`.pdi:focus{box-shadow:0 0 0 2px var(--primary)}`}</style>
        <Banner tone="rose">
          탈퇴하면 계정과 모든 데이터가 영구적으로 삭제돼요. 이 작업은 되돌릴 수 없어요.
        </Banner>
        {err && <Banner tone="rose">{err}</Banner>}
        <Field label="확인을 위해 DELETE를 입력해 주세요" required>
          <Input
            className="pdi"
            style={INPUT_STYLE}
            placeholder="DELETE"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <div className="mt-1 flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>
            취소
          </Button>
          <Button
            variant="danger"
            loading={busy}
            disabled={confirm !== "DELETE"}
            icon="trash"
            onClick={submit}
          >
            영구 삭제
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
