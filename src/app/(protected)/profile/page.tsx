import { redirect } from "next/navigation";

/** Offleash v2: the profile hub lives at /me now. */
export default function ProfileRedirect() {
  redirect("/me");
}
