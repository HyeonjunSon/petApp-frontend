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
    if (confirm !== "DELETE") return setErr("Please type DELETE exactly.");
    setBusy(true);
    try {
      await api.delete("/account");
      onDeleted();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to delete account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={close} title="Delete account">
      <div className="flex flex-col gap-3 px-5 pt-2 pb-6">
        <style>{`.pdi:focus{box-shadow:0 0 0 2px var(--primary)}`}</style>
        <Banner tone="rose">
          Deleting your account permanently removes your account and all data. This action cannot be undone.
        </Banner>
        {err && <Banner tone="rose">{err}</Banner>}
        <Field label="Type DELETE to confirm" required>
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
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={busy}
            disabled={confirm !== "DELETE"}
            icon="trash"
            onClick={submit}
          >
            Delete permanently
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
