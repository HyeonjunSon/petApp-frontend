"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useLocale } from "@/lib/i18n";
import { Banner, Button, Field, Input, Sheet } from "@/components/ui";

export default function PasswordSheet({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLocale();
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
    if (next !== confirm) return setErr(t("settings.pw.mismatch"));
    if (next.length < 8) return setErr(t("settings.pw.tooShort"));
    setBusy(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: current,
        newPassword: next,
      });
      reset();
      onDone();
    } catch (e: any) {
      setErr(e?.response?.data?.message || t("settings.pw.err"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={close} title={t("settings.change.password")}>
      <div className="flex flex-col gap-3 px-5 pt-2 pb-6">
        {err && <Banner tone="rose">{err}</Banner>}
        <Field label={t("settings.pw.current")} required>
          <Input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </Field>
        <Field
          label={t("settings.pw.new")}
          required
          hint={t("auth.field.passwordHint")}
        >
          <Input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </Field>
        <Field label={t("settings.pw.confirm")} required>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <div className="mt-1 flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>
            {t("common.cancel")}
          </Button>
          <Button
            loading={busy}
            disabled={!current || !next || !confirm}
            onClick={submit}
          >
            {t("settings.pw.update")}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
