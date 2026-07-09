/**
 * Shared Card type + adapter for /discover candidates.
 * Backend returns user docs with mixed photos; we normalize into a Card shape.
 */

export type Card = {
  id: string;
  ownerName?: string;
  ownerAge?: number;
  ownerFace?: string;
  ownerAbout?: string;
  location?: string;
  goal?: string;
  verified?: boolean;
  petName?: string;
  breed?: string;
  age?: number;
  size?: string;
  temperament?: string[];
  petAbout?: string;
  photos: string[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050/api";
const ORIGIN = API_BASE.replace(/\/api$/, "");

export const toAbs = (u?: string) =>
  !u ? "" : u.startsWith("http") ? u : `${ORIGIN}${u}`;

export const SIZE_LABEL: Record<string, string> = {
  s: "Small",
  m: "Medium",
  l: "Large",
};

export const GOAL_LABEL: Record<string, string> = {
  dating: "Dating",
  friends: "Friends",
  both: "Friends & dating",
};

export function adapt(u: any): Card {
  const petPhotos = (Array.isArray(u.petPhotos) ? u.petPhotos : [])
    .map(toAbs)
    .filter(Boolean);
  const allList = Array.isArray(u?.photos) ? u.photos : [];
  const mixedPet = allList
    .filter((p: any) => p?.type === "pet")
    .map((p: any) => toAbs(p?.url))
    .filter(Boolean);
  const facePhotos = (Array.isArray(u.facePhotos) ? u.facePhotos : [])
    .map(toAbs)
    .filter(Boolean);
  const ownerFaceFromList = allList.find((p: any) => p?.type === "owner_face");

  const pet =
    u.pet || (Array.isArray(u.pets) ? u.pets[0] : undefined) || undefined;

  const photos: string[] = Array.from(
    new Set([...petPhotos, ...mixedPet, ...facePhotos])
  );

  return {
    id: String(u.id ?? u._id),
    ownerName: u.name,
    ownerAge:
      u.ownerAge ??
      (u.birthYear ? new Date().getFullYear() - u.birthYear : undefined),
    ownerFace:
      facePhotos[0] ||
      (ownerFaceFromList ? toAbs(ownerFaceFromList.url) : undefined),
    ownerAbout: u.about || "",
    location: u.location || u.locationName || "",
    goal: u.goal,
    verified: !!u.verified,
    petName: pet?.name,
    breed: pet?.breed,
    age: pet?.age,
    size: pet?.size,
    temperament: Array.isArray(pet?.temperament) ? pet.temperament : [],
    petAbout: pet?.about || pet?.bio || "",
    photos,
  };
}
