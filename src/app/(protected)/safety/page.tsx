"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, Button, Field, Input, Select, Textarea, Badge, cx } from "@/components/ui";

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

const CATEGORIES = ["Spam/Ads", "Hate/Harassment", "Sexual/Explicit", "Scam/Money request", "Stalking/Threats", "Other"] as const;
const MAX_FILES = 20;
const MAX_SIZE = 25 * 1024 * 1024;
const ALLOWED = /^(image|video|audio)\//;

export default function SafetyPage() {
  const [toast, setToast] = useState("");

  // blocks
  const [blockId, setBlockId] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const loadBlocks = async () => {
    try { const { data } = await api.get<Block[]>("/blocks"); setBlocks(data); } catch {}
  };
  const addBlock = async () => {
    const id = blockId.trim();
    if (!id) return;
    if (!confirm(`Block user ${id}?`)) return;
    try {
      await api.post("/blocks", { targetId: id });
      setBlockId(""); setToast("User blocked."); loadBlocks();
    } catch { setToast("Something went wrong while blocking."); }
  };
  const removeBlock = async (b: Block) => {
    if (!confirm("Unblock this user?")) return;
    try { await api.delete(`/blocks/${b._id}`); setToast("User unblocked."); loadBlocks(); }
    catch { setToast("Something went wrong while unblocking."); }
  };

  // reports
  const [reportId, setReportId] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const loadReports = async () => {
    try { const { data } = await api.get<Report[]>("/reports?limit=20"); setReports(data); } catch {}
  };

  const onPickFiles = (picked: FileList | null) => {
    const arr = Array.from(picked || []);
    if (arr.find((f) => !ALLOWED.test(f.type))) return setToast("Only image/video/audio files are allowed.");
    if (arr.find((f) => f.size > MAX_SIZE)) return setToast("Each file can be up to 25MB.");
    setFiles([...files, ...arr].slice(0, MAX_FILES));
  };

  const submitReport = async () => {
    const id = reportId.trim(), why = reason.trim();
    if (!id) return setToast("Please enter the user ID.");
    if (!why) return setToast("Please enter a reason.");
    if (!confirm("False reports may lead to penalties. Submit this report?")) return;
    setSending(true);
    try {
      let evidenceUrls: string[] | undefined;
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("evidences", f));
        const up = await api.post<{ urls: string[] }>("/reports/evidences", fd, { headers: { "Content-Type": "multipart/form-data" } });
        evidenceUrls = up.data.urls;
      }
      await api.post("/reports", { targetId: id, category, reason: why, evidenceUrls });
      setReportId(""); setCategory(CATEGORIES[0]); setReason(""); setFiles([]);
      setToast("Report submitted."); loadReports();
    } catch { setToast("Something went wrong while submitting."); }
    finally { setSending(false); }
  };

  useEffect(() => { loadBlocks(); loadReports(); }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Report / Block</h1>
        <p className="mt-1 text-sm text-slate-500">Block or report users who make you uncomfortable.</p>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* 차단 */}
        <div className="col-span-12 lg:col-span-5">
          <Card>
            <CardHeader title="Blocking" subtitle="Blocked users won't appear in profiles, chat, or matching." />
            <div className="flex items-center gap-2">
              <Input placeholder="User ID" value={blockId} onChange={(e) => setBlockId(e.target.value)} />
              <Button variant="danger" onClick={addBlock} className="shrink-0">Block</Button>
            </div>
            <div className="mt-4 space-y-2">
              {blocks.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  No blocked users yet.
                </div>
              )}
              {blocks.map((b) => (
                <div key={b._id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <div className="text-sm">
                    <span className="font-medium">{b.targetId}</span>
                    <span className="ml-2 text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => removeBlock(b)}>Unblock</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 신고 */}
        <div className="col-span-12 lg:col-span-7">
          <Card>
            <CardHeader title="Submit a report" subtitle="False reports may lead to account restrictions." />
            <div className="grid grid-cols-12 gap-3">
              <Field label="User ID" className="col-span-12 md:col-span-6">
                <Input value={reportId} onChange={(e) => setReportId(e.target.value)} placeholder="e.g. 64fa...c8" />
              </Field>
              <Field label="Report type" className="col-span-12 md:col-span-6">
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Reason" className="col-span-12">
                <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe what happened, what they sent, when, etc." />
              </Field>
              <Field label="Evidence (optional)" hint="Image/video/audio, up to 20 files · 25MB each" className="col-span-12">
                <input
                  type="file" multiple accept="image/*,video/*,audio/*"
                  onChange={(e) => onPickFiles(e.target.files)}
                  className="w-full cursor-pointer rounded-[10px] border border-slate-200 bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:border-slate-300"
                />
                {files.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    {files.length} selected ({Math.round(files.reduce((a, f) => a + f.size, 0) / 1024)}KB)
                  </div>
                )}
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={submitReport} loading={sending}>Report</Button>
            </div>
          </Card>
        </div>

        {/* 최근 신고 */}
        <div className="col-span-12">
          <Card padded={false}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold">Recent reports</h2>
              <span className="text-xs text-slate-500">{reports.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500">
                    <th className="px-5 py-2.5 font-medium">Target</th>
                    <th className="px-3 py-2.5 font-medium">Type</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 font-medium">Evidence</th>
                    <th className="px-3 py-2.5 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No reports submitted.</td></tr>
                  )}
                  {reports.map((r) => (
                    <tr key={r._id} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3 font-medium">{r.targetId}</td>
                      <td className="px-3 py-3">{r.category}</td>
                      <td className="px-3 py-3">
                        <Badge tone={r.status === "resolved" ? "brand" : r.status === "reviewing" ? "amber" : "neutral"}>
                          {r.status === "resolved" ? "Resolved" : r.status === "reviewing" ? "Reviewing" : "Received"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        {r.evidenceUrls?.length ? (
                          <a href={r.evidenceUrls[0]} target="_blank" rel="noreferrer" className="text-brand-700 underline">{r.evidenceUrls.length}</a>
                        ) : "-"}
                      </td>
                      <td className="px-3 py-3 text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
