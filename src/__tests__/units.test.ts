/** Pure helpers — formatting + the discover card adapter. */
import { fmtDistance } from "@/lib/feed-demo";
import { timeAgo } from "@/components/feed";
import { adapt } from "@/lib/card";

describe("fmtDistance", () => {
  it("uses metres under 1 km and kilometres above", () => {
    expect(fmtDistance(450)).toBe("450 m");
    expect(fmtDistance(999)).toBe("999 m");
    expect(fmtDistance(1000)).toBe("1.0 km");
    expect(fmtDistance(2451)).toBe("2.5 km");
  });
});

describe("timeAgo", () => {
  it("buckets into now / minutes / hours / days", () => {
    const now = Date.now();
    expect(timeAgo(new Date(now - 30 * 1000).toISOString())).toBe("just now");
    expect(timeAgo(new Date(now - 5 * 60 * 1000).toISOString())).toBe("5 min ago");
    expect(timeAgo(new Date(now - 3 * 3600 * 1000).toISOString())).toBe("3 h");
    expect(timeAgo(new Date(now - 26 * 3600 * 1000).toISOString())).toBe("yesterday");
    expect(timeAgo(undefined)).toBe("");
  });
});

describe("adapt (discover card adapter)", () => {
  it("normalizes a server card: pet fields, photo precedence, distance", () => {
    const card = adapt({
      id: "u1",
      name: "Haneul Jung",
      verified: true,
      locationName: "Seoul · Eunpyeong",
      distanceM: 1139,
      petPhotos: ["https://cdn/pet1.jpg"],
      facePhotos: ["https://cdn/face.jpg"],
      pet: { name: "Haru", breed: "Shiba Inu", age: 5, size: "m", temperament: ["Independent"] },
      photos: [],
    });
    expect(card.id).toBe("u1");
    expect(card.petName).toBe("Haru");
    expect(card.breed).toBe("Shiba Inu");
    expect(card.size).toBe("m");
    expect(card.distanceM).toBe(1139);
    expect(card.photos[0]).toBe("https://cdn/pet1.jpg"); // pet photos before face photos
    expect(card.ownerFace).toBe("https://cdn/face.jpg");
  });

  it("tolerates a user with no pet and no coordinates", () => {
    const card = adapt({ _id: "u2", name: "Neighbour", photos: [] });
    expect(card.id).toBe("u2");
    expect(card.petName).toBeUndefined();
    expect(card.distanceM).toBeUndefined();
    expect(card.photos).toEqual([]);
  });
});
