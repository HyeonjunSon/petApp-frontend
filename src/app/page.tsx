"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Home - redirects to /dashboard immediately.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}
