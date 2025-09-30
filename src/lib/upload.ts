// frontend/lib/upload.ts
import { api } from "@/lib/api";

export async function uploadUserPhoto(file: File, type: "owner_face"|"pet"="pet") {
  const fd = new FormData();
  fd.append("photo", file);
  fd.append("type", type);
  const { data } = await api.post("/users/me/photo", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { url: string; publicId: string; type: string };
}
