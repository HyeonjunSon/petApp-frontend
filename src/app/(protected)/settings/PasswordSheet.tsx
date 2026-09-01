"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Banner, Button, Field, Input, Sheet } from "@/components/ui";

const INPUT_STYLE: React.CSSProperties = {
  border: "none",
  background: "var(--paper)",
  borderRadius: "var(--radius-input)",
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
    if (next !== confirm) return setErr("New passwords do not match.");
    if (next.length < 8) return setErr("Password must be at least 8 characters.");
    setBusy(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: current,
        newPassword: next,
      });
      reset();
      onDone();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to change password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={close} title="Change password">
      <div className="flex flex-col gap-3 px-5 pt-2 pb-6">
        <style>{`.pdi:focus{outline:2px solid var(--ink) !important}`}</style>
        {err && <Banner tone="rose">{err}</Banner>}
        <Field label="Current password" required>
          <Input
            className="pdi"
            style={INPUT_STYLE}
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </Field>
        <Field label="New password" required hint="Must be at least 8 characters.">
          <Input
            className="pdi"
            style={INPUT_STYLE}
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </Field>
        <Field label="Confirm new password" required>
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
            Cancel
          </Button>
          <Button
            loading={busy}
            disabled={!current || !next || !confirm}
            onClick={submit}
          >
            Change password
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
