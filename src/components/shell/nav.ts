// Shared nav model for the PetDate app shell (시안: 좌측 사이드바 5개 메뉴).
import type { IconName } from "@/components/ui";

export type NavItem = { href: string; label: string; icon: IconName };

export const NAV: NavItem[] = [
  { href: "/home", label: "홈", icon: "home" },
  { href: "/discover", label: "디스커버", icon: "heart" },
  { href: "/walks", label: "산책", icon: "walk" },
  { href: "/chat", label: "채팅", icon: "chat" },
  { href: "/profile", label: "프로필", icon: "user" },
];

export function isCurrent(path: string, href: string) {
  return path === href || path.startsWith(href + "/");
}
