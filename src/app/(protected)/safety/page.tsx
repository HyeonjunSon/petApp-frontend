"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type Block = { _id: string; targetId: string; createdAt: string };
type Report = {
  _id: string;
  targetId: string;
  category: string;
  reason: string;
  evidenceUrls?: string[];
  status?: "received" | "reviewing" | "resolved";
  createdAt: string;
};

const CATEGORIES = [
  "스팸/광고",
  "혐오/비하",
  "성적 불쾌감/음란",
  "사기/금전 요구",
  "스토킹/위협",
  "기타",
] as const;

export default function ReportBlockPage() {
  // 공통 상태
  const [toast, setToast] = useState<string>("");

  // ── 차단 ──────────────────────────────────────────────────────────────
  const [blockId, setBlockId] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const loadBlocks = async () => {
    try {
      const { data } = await api.get<Block[]>("/blocks");
      setBlocks(data);
    } catch (e) {
      console.error("GET /blocks failed", e);
    }
  };

  const addBlock = async () => {
    const id = blockId.trim();
    if (!id) return;
    if (!confirm(`정말 ${id} 사용자를 차단할까요?`)) return;
    try {
      await api.post("/blocks", { targetId: id });
      setBlockId("");
      setToast("차단이 완료되었습니다.");
      loadBlocks();
    } catch (e) {
      console.error("POST /blocks failed", e);
      setToast("차단 중 문제가 발생했어요.");
    }
  };

  const removeBlock = async (b: Block) => {
    if (!confirm("차단을 해제할까요?")) return;
    try {
      await api.delete(`/blocks/${b._id}`);
      setToast("차단이 해제되었습니다.");
      loadBlocks();
    } catch (e) {
      console.error("DELETE /blocks/:id failed", e);
      setToast("해제 중 문제가 발생했어요.");
    }
  };

  // ── 신고 ──────────────────────────────────────────────────────────────
  const [reportId, setReportId] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

  const [reports, setReports] = useState<Report[]>([]);
  const loadReports = async () => {
    try {
      const { data } = await api.get<Report[]>("/reports?limit=20");
      setReports(data);
    } catch (e) {
      console.error("GET /reports failed", e);
    }
  };

  const submitReport = async () => {
    const id = reportId.trim();
    const why = reason.trim();
    if (!id) return setToast("상대 사용자 ID를 입력해 주세요.");
    if (!why) return setToast("신고 사유를 입력해 주세요.");

    if (!confirm("사실과 다를 경우 제재될 수 있습니다. 신고를 접수할까요?")) return;

    setSending(true);
    try {
      let evidenceUrls: string[] | undefined;
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("evidences", f));
        // 서버 업로드 엔드포인트 예시
        const up = await api.post<{ urls: string[] }>("/uploads/evidences", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        evidenceUrls = up.data.urls;
      }
      await api.post("/reports", {
        targetId: id,
        category,
        reason: why,
        evidenceUrls,
      });
      setReportId("");
      setCategory(CATEGORIES[0]);
      setReason("");
      setFiles([]);
      setToast("신고가 접수되었습니다.");
      loadReports();
    } catch (e) {
      console.error("POST /reports failed", e);
      setToast("신고 접수 중 문제가 발생했어요.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadBlocks();
    loadReports();
  }, []);

  // 작은 토스트
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">신고 / 차단</h1>
      </div>

      {/* 알림 */}
      {!!toast && (
        <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* 차단 카드 */}
        <section className="col-span-12 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold">차단 관리</h2>

            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-500"
                placeholder="상대 사용자 ID"
                value={blockId}
                onChange={(e) => setBlockId(e.target.value)}
              />
              <button
                onClick={addBlock}
                className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
              >
                차단
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              차단 시 서로의 프로필/채팅/매칭에서 보이지 않으며, 기존 대화 알림도 차단됩니다.
            </p>

            <div className="mt-4">
              <div className="mb-2 text-sm font-medium text-slate-700">차단 목록</div>
              <div className="space-y-2">
                {blocks.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    아직 차단한 사용자가 없습니다.
                  </div>
                )}
                {blocks.map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="text-sm">
                      <span className="font-medium">{b.targetId}</span>
                      <span className="ml-2 text-slate-400">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => removeBlock(b)}
                      className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      해제
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 신고 카드 */}
        <section className="col-span-12 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold">신고 접수</h2>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-6">
                <Label>상대 사용자 ID</Label>
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  value={reportId}
                  onChange={(e) => setReportId(e.target.value)}
                  placeholder="예: 64fa...c8"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <Label>신고 유형</Label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-12">
                <Label>신고 사유</Label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="발생한 일/상대가 보낸 내용/일시 등 구체적으로 작성해 주세요."
                />
                <p className="mt-1 text-xs text-slate-500">
                  허위 신고는 서비스 이용 제한의 사유가 됩니다.
                </p>
              </div>

              <div className="col-span-12">
                <Label>
                  증거 파일(선택) <span className="text-slate-400">(이미지/영상/녹음 등)</span>
                </Label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:border-slate-400"
                />
                {files.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    {files.length}개 선택됨 ({Math.round(files.reduce((a, f) => a + f.size, 0) / 1024)}KB)
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={submitReport}
                disabled={sending}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending && (
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                )}
                신고
              </button>
            </div>
          </div>
        </section>

        {/* 최근 신고 목록 */}
        <section className="col-span-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">최근 신고</h2>
              <span className="text-xs text-slate-500">{reports.length}건</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="px-3 py-2">대상</th>
                    <th className="px-3 py-2">유형</th>
                    <th className="px-3 py-2">상태</th>
                    <th className="px-3 py-2">증거</th>
                    <th className="px-3 py-2">일시</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                        접수된 신고가 없습니다.
                      </td>
                    </tr>
                  )}
                  {reports.map((r) => (
                    <tr key={r._id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{r.targetId}</td>
                      <td className="px-3 py-2">{r.category}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            r.status === "resolved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : r.status === "reviewing"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-50 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {r.status || "접수"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {r.evidenceUrls?.length ? (
                          <a
                            href={r.evidenceUrls[0]}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 underline underline-offset-2"
                          >
                            {r.evidenceUrls.length}개
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              ※ 실제 운영 시, 신고 유형·증거 업로드 → 자동 알림/관리자 검토 플로우를 추가하는 것을 권장합니다.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 text-sm font-medium text-slate-700">{children}</div>;
}
