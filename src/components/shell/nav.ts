// Shared nav model for the PetDate app shell (wireframe IA).
export type NavItem = { href: string; label: string };

export const NAV: NavItem[] = [
  { href: "/discover", label: "Discover" },
  { href: "/matches", label: "Matches" },
  { href: "/walks", label: "Walks" },
  { href: "/settings", label: "Settings" },
  { href: "/subscription", label: "Subscription" },
];

export function isCurrent(path: string, href: string) {
  return path === href || path.startsWith(href + "/");
}
