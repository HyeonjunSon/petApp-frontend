"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";

type Photo = {
  _id: string;
  url: string;          // ex) /uploads/xxx.jpg  (서버 상대경로)
  originalName: string;
  size: number;
  createdAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050/api";
// 업로드 정적 경로는 /api 를 제거한 베이스에 붙입니다. → http://localhost:5050 + /uploads/xxx
const UPLOAD_BASE = API_BASE.replace(/\/api\/?$/, "");

export default function PhotosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // 로컬 미리보기
  const [list, setList] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchList = async () => {
    try {
      const { data } = await api.get<Photo[]>("/photos");
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // 파일 선택 핸들러
  const onPick = (f: File | null) => {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPick(e.target.files?.[0] || null);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    onPick(f || null);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      await api.post("/photos", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onPick(null);
      await fetchList();
    } catch (e) {
      alert("업로드 실패");
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    await api.delete(`/photos/${id}`);
    await fetchList();
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">사진 업로드</h1>

      {/* 업로더 박스 */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* 드래그&드롭 + 파일선택 */}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-slate-600 ${
              dragOver ? "border-emerald-500 ring-2 ring-emerald-200" : "border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate">
                {file ? `선택됨: ${file.name}` : "여기로 파일을 드래그하거나, 오른쪽 버튼으로 선택하세요."}
              </span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); inputRef.current?.click(); }}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                사진 선택
              </button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onChange}
            />
          </label>

          {/* 업로드 버튼 */}
          <button
            onClick={upload}
            disabled={!file || uploading}
            className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "업로드 중…" : "업로드"}
          </button>
        </div>

        {/* 로컬 미리보기 */}
        {preview && (
          <div className="mt-4">
            <div className="text-sm mb-2 text-slate-500">미리보기</div>
            <div className="rounded-xl border border-slate-200 p-3 w-64 bg-slate-50">
              {/* 로컬 blob URL → 미리보기는 UPLOAD_BASE 불필요 */}
              <img src={preview} alt="preview" className="h-40 w-full rounded-md object-cover" />
              <div className="mt-2 truncate text-sm">{file?.name}</div>
              <div className="text-xs text-slate-500">
                {file ? Math.round(file.size / 1024) : 0} KB
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 업로드된 목록 */}
      {loading ? (
        <div className="text-slate-500">불러오는 중…</div>
      ) : list.length === 0 ? (
        <div className="text-slate-500">아직 업로드된 사진이 없습니다.</div>
      ) : (
        <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <li key={p._id} className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              {/* 서버 상대경로 → 절대경로로 변환 */}
              <img
                src={`${UPLOAD_BASE}${p.url}`}
                alt={p.originalName}
                className="h-44 w-full rounded-lg object-cover"
              />
              <div className="mt-2 truncate text-sm">{p.originalName}</div>
              <div className="text-xs text-slate-500">{Math.round(p.size / 1024)} KB</div>
              <button
                className="mt-2 w-full rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
                onClick={() => remove(p._id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
