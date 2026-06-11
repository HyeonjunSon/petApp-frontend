"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardHeader, Button, Field, Input, Chip, cx } from "@/components/ui";
import { useTheme } from "@/lib/theme";

type Prefs = {
  maxDistance: number;
  ageRange: [number, number];
  species: "all" | "dog" | "cat";
  discoverable: boolean;
  push: boolean;
};

const DEFAULT: Prefs = {
  maxDistance: 10,
  ageRange: [20, 40],
  species: "all",
  discoverable: true,
  push: true,
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get<Partial<Prefs>>("/settings"); setPrefs({ ...DEFAULT, ...data }); }
      catch {}
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const save = async () => {
    setSaving(true);
    try { await api.put("/settings", prefs); setToast("Settings saved ✓"); }
    catch { setToast("Something went wrong while saving"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Adjust your matching visibility and notifications.</p>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader title="Matching / visibility" />
            <div className="grid grid-cols-12 gap-5">
              <Field label="Max distance (km)" className="col-span-12 md:col-span-6">
                <div className="flex items-center gap-3">
                  <Input type="number" min={1} max={100} value={prefs.maxDistance}
                    onChange={(e) => setPrefs((p) => ({ ...p, maxDistance: clamp(+e.target.value || 1, 1, 100) }))}
                    className="w-28" />
                  <input type="range" min={1} max={100} value={prefs.maxDistance}
                    onChange={(e) => setPrefs((p) => ({ ...p, maxDistance: +e.target.value }))}
                    className="flex-1 accent-brand-600" />
                </div>
              </Field>

              <Field label="Show me" className="col-span-12 md:col-span-6">
                <div className="flex gap-2">
                  {(["all", "dog", "cat"] as const).map((v) => (
                    <button key={v} type="button"
                      onClick={() => setPrefs((p) => ({ ...p, species: v }))}
                      className={cx(
                        "rounded-lg px-4 py-2.5 text-sm transition",
                        prefs.species === v ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      )}>
                      {v === "all" ? "All" : v === "dog" ? "Dogs" : "Cats"}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Pet age range" className="col-span-12">
                <div className="flex flex-wrap items-center gap-3">
                  <Input type="number" min={0} max={80} value={prefs.ageRange[0]}
                    onChange={(e) => setPrefs((p) => ({ ...p, ageRange: [clamp(+e.target.value || 0, 0, p.ageRange[1]), p.ageRange[1]] }))}
                    className="w-24" />
                  <span className="text-slate-400">—</span>
                  <Input type="number" min={0} max={80} value={prefs.ageRange[1]}
                    onChange={(e) => setPrefs((p) => ({ ...p, ageRange: [p.ageRange[0], clamp(+e.target.value || 0, p.ageRange[0], 80)] }))}
                    className="w-24" />
                  <span className="text-sm text-slate-500">yrs</span>
                </div>
              </Field>

              <div className="col-span-12 md:col-span-6">
                <Toggle label="Show my profile / card" checked={prefs.discoverable} onChange={(v) => setPrefs((p) => ({ ...p, discoverable: v }))} />
              </div>
              <div className="col-span-12 md:col-span-6">
                <Toggle label="Allow notifications" checked={prefs.push} onChange={(v) => setPrefs((p) => ({ ...p, push: v }))} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPrefs(DEFAULT)}>Reset</Button>
              <Button onClick={save} loading={saving}>Save</Button>
            </div>
          </Card>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-4">
          <Card>
            <CardHeader title="Appearance" />
            <div className="flex flex-wrap gap-2">
              <Chip active={theme === "light"} onClick={() => setTheme("light")}>Light</Chip>
              <Chip active={theme === "dark"} onClick={() => setTheme("dark")}>Dark</Chip>
              <Chip active={theme === "system"} onClick={() => setTheme("system")}>System</Chip>
            </div>
          </Card>

          <Card>
            <CardHeader title="Report / Block" />
            <p className="mb-3 text-sm text-slate-600">Go to the blocking and reporting page.</p>
            <Link href="/safety"><Button variant="secondary" fullWidth>Go</Button></Link>
          </Card>

          <Card className="border-rose-200 bg-rose-50">
            <h2 className="mb-2 text-base font-semibold text-rose-800">Delete account</h2>
            <p className="mb-3 text-sm text-rose-700">All your data will be permanently deleted. This cannot be undone.</p>
            <Button
              variant="danger"
              onClick={async () => {
                if (!confirm("Delete your account? This cannot be undone.")) return;
                try { await api.delete("/account"); location.href = "/"; }
                catch { alert("Something went wrong while deleting."); }
              }}
            >
              Delete account
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5"
    >
      <span className="text-sm text-slate-700">{label}</span>
      <span className={cx("relative inline-flex h-6 w-11 items-center rounded-full transition", checked ? "bg-brand-600" : "bg-slate-300")}>
        <span className={cx("inline-block h-5 w-5 transform rounded-full bg-white shadow transition", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
      </span>
    </button>
  );
}
