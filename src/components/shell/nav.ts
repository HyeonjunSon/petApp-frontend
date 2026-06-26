// Shared nav model for the PetDate app shell (wireframe IA).
export type NavItem = { href: string; label: string };

export const NAV: NavItem[] = [
  { href: "/discover", label: "디스커버" },
  { href: "/matches", label: "매칭" },
  { href: "/walks", label: "산책약속" },
  { href: "/settings", label: "설정" },
  { href: "/subscription", label: "구독" },
];

export function isCurrent(path: string, href: string) {
  return path === href || path.startsWith(href + "/");
}
