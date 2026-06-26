"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useLocale } from "@/lib/i18n";
import { Banner, Button, Field, Input, Sheet } from "@/components/ui";

export default function DeleteSheet({
  open,
  onClose,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useLocale();
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
    if (confirm !== "DELETE") return setErr(t("settings.del.confirmErr"));
    setBusy(true);
    try {
      await api.delete("/account");
      onDeleted();
    } catch (e: any) {
      setErr(e?.response?.data?.message || t("settings.del.err"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={close} title={t("settings.delete.account")}>
      <div className="flex flex-col gap-3 px-5 pt-2 pb-6">
        <Banner tone="rose">{t("settings.del.warn")}</Banner>
        {err && <Banner tone="rose">{err}</Banner>}
        <Field label={t("settings.del.confirmLabel")} required>
          <Input
            placeholder="DELETE"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <div className="mt-1 flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="danger"
            loading={busy}
            disabled={confirm !== "DELETE"}
            icon="trash"
            onClick={submit}
          >
            {t("settings.del.go")}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
