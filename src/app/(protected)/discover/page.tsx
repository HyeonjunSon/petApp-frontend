import { redirect } from "next/navigation";

/** Offleash v2: Discover lives at /pack now. */
export default function DiscoverRedirect() {
  redirect("/pack");
}
