"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Card, Button, Banner, cx } from "@/components/ui";

type Photo = {
  _id: string;
  url: string;
  originalName?: string;
  size?: number;
  createdAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050/api";
const ORIGIN = API_BASE.replace(/\/api\/?$/, "");
const cdnThumb = (url: string, w = 320, h = 320) =>
  url?.includes("/upload/")
    ? url.replace("/upload/", `/upload/c_fill,w_${w},h_${h},f_auto,q_auto/`)
    : url;
const toAbs = (u?: string) => (!u ? "" : u.startsWith("http") ? u : `${ORIGIN}${u}`);
const ALLOWED = /^image\/(png|jpe?g|webp|gif|bmp|svg\+xml)$/;
const MAX_SIZE = 10 * 1024 * 1024;

export default function PhotosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [list, setList] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [ver, setVer] = useState(0);
  const [msg, setMsg] = useState("");

  const fetchList = async () => {
    try {
      const { data } = await api.get<Photo[]>("/photos");
      setList(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchList(); }, []);

  const onPick = (f: File | null) => {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault(); e.stopPropagation();
    setDragOver(false);
    onPick(e.dataTransfer.files?.[0] || null);
  };

  const upload = async () => {
    if (!file) return;
    if (!ALLOWED.test(file.type)) { setMsg("Only image files are allowed."); return; }
    if (file.size > MAX_SIZE) { setMsg("Max file size is 10MB."); return; }
    setUploading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("photo", file);
      await api.post("/photos", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onPick(null);
      await fetchList();
      setVer((v) => v + 1);
    } catch (e) {
      setMsg("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    await api.delete(`/photos/${id}`);
    await fetchList();
    setVer((v) => v + 1);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Photos</h1>
        <p className="mt-1 text-sm text-slate-500">Collect your pet's moments.</p>
      </div>

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={cx(
              "flex-1 cursor-pointer rounded-xl border border-dashed px-4 py-4 text-sm text-slate-600 transition",
              dragOver ? "border-brand-500 bg-brand-50/50" : "border-slate-300"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate">{file ? `Selected: ${file.name}` : "Drag a file here, or choose from the right."}</span>
              <Button type="button" variant="secondary" size="sm" onClick={(e) => { e.preventDefault(); inputRef.current?.click(); }}>
                Choose photo
              </Button>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0] || null)} />
          </label>
          <Button onClick={upload} disabled={!file} loading={uploading}>Upload</Button>
        </div>

        {preview && (
          <div className="mt-4">
            <div className="mb-2 text-sm text-slate-500">Preview</div>
            <div className="w-64 rounded-xl border border-slate-200 bg-slate-50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="h-40 w-full rounded-md object-cover" />
              <div className="mt-2 truncate text-sm">{file?.name}</div>
              <div className="text-xs text-slate-500">{file ? Math.round(file.size / 1024) : 0} KB</div>
            </div>
          </div>
        )}

        {!!msg && <div className="mt-3"><Banner tone="rose">{msg}</Banner></div>}
      </Card>

      {loading ? (
        <Card><div className="text-sm text-slate-500">Loading…</div></Card>
      ) : list.length === 0 ? (
        <Card><div className="text-sm text-slate-500">No photos uploaded yet.</div></Card>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => {
            const raw = toAbs(p.url);
            const src = raw.startsWith("http") ? cdnThumb(raw, 320, 320) : raw;
            const srcV = src ? `${src}${src.includes("?") ? "&" : "?"}v=${ver}` : src;
            return (
              <li key={p._id} className="surface overflow-hidden rounded-2xl p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={srcV}
                  alt={p.originalName || ""}
                  className="h-40 w-full rounded-lg object-cover"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.dataset.fb === "1") return;
                    img.dataset.fb = "1";
                    img.src = "/img/pet-placeholder.svg";
                  }}
                />
                <div className="mt-2 truncate px-1 text-sm">{p.originalName || "Image"}</div>
                {!!p.size && <div className="px-1 text-xs text-slate-500">{Math.round(p.size / 1024)} KB</div>}
                <button onClick={() => remove(p._id)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
