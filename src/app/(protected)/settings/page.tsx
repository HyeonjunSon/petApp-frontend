"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Prefs = {
  maxDistance: number;          // km
  ageRange: [number, number];   // 18~80
  species: "all" | "dog" | "cat";
  discoverable: boolean;        // 내 프로필/카드 노출
  push: boolean;                // 푸시/알림 허용
};

const DEFAULT: Prefs = {
  maxDistance: 10,
  ageRange: [20, 40],
  species: "all",
  discoverable: true,
  push: true,
};

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Partial<Prefs>>("/settings");
        setPrefs({ ...DEFAULT, ...data });
      } catch {
        // 최초엔 기본값으로
      }
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/settings", prefs);
      setToast("설정이 저장됐어요 ✅");
    } catch {
      setToast("저장 중 문제가 발생했어요 ❌");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => setPrefs(DEFAULT);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">설정</h1>

      {!!toast && (
        <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* 기본 설정 카드 */}
        <section className="col-span-12 lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">매칭/노출</h2>

            {/* 거리 + 대상 */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Label>최대 거리 (km)</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={prefs.maxDistance}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, maxDistance: clamp(+e.target.value || 1, 1, 100) }))
                    }
                    className="w-32 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={prefs.maxDistance}
                    onChange={(e) => setPrefs((p) => ({ ...p, maxDistance: +e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="col-span-12 md:col-span-6">
                <Label>보이는 대상</Label>
                <div className="flex gap-2">
                  {(["all", "dog", "cat"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setPrefs((p) => ({ ...p, species: v }))}
                      className={`rounded-lg px-4 py-2 text-sm transition ${
                        prefs.species === v
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                      type="button"
                    >
                      {v === "all" ? "전체" : v === "dog" ? "강아지" : "고양이"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 나이 범위 */}
              <div className="col-span-12">
                <Label>상대 펫 나이 범위</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <NumberBox
                    value={prefs.ageRange[0]}
                    onChange={(v) =>
                      setPrefs((p) => ({ ...p, ageRange: [clamp(v, 0, p.ageRange[1]), p.ageRange[1]] }))
                    }
                    min={0}
                    max={80}
                    suffix="살"
                  />
                  <span className="text-slate-400">—</span>
                  <NumberBox
                    value={prefs.ageRange[1]}
                    onChange={(v) =>
                      setPrefs((p) => ({ ...p, ageRange: [p.ageRange[0], clamp(v, p.ageRange[0], 80)] }))
                    }
                    min={0}
                    max={80}
                    suffix="살"
                  />
                </div>
              </div>

              {/* 토글들 */}
              <div className="col-span-12 md:col-span-6">
                <Toggle
                  label="프로필/카드 노출 허용"
                  checked={prefs.discoverable}
                  onChange={(v) => setPrefs((p) => ({ ...p, discoverable: v }))}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <Toggle
                  label="알림 수신 허용"
                  checked={prefs.push}
                  onChange={(v) => setPrefs((p) => ({ ...p, push: v }))}
                />
              </div>
            </div>

            {/* 저장 */}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                초기화
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? "저장 중…" : "저장"}
              </button>
            </div>
          </div>
        </section>

        {/* 계정/보안 */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold">차단/신고</h2>
            <p className="mb-3 text-sm text-slate-600">차단 관리 및 신고 접수 페이지로 이동합니다.</p>
            <a
              href="/report"
              className="inline-flex rounded-lg border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              이동하기
            </a>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
            <h2 className="mb-2 text-base font-semibold text-rose-800">계정 삭제</h2>
            <p className="mb-3 text-sm text-rose-700">
              모든 데이터가 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <button
              onClick={async () => {
                if (!confirm("정말 계정을 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다.")) return;
                try {
                  await api.delete("/account");
                  location.href = "/"; // 로그아웃/리다이렉트
                } catch {
                  alert("삭제 중 오류가 발생했습니다.");
                }
              }}
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              계정 삭제
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------- 작은 컴포넌트 ---------- */

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 text-sm font-medium text-slate-700">{children}</div>;
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <span className="text-sm text-slate-700">{label}</span>
      <span
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </label>
  );
}

function NumberBox({
  value,
  onChange,
  min = 0,
  max = 100,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(+e.target.value || min, min, max))}
        className="w-24 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
      />
      {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
