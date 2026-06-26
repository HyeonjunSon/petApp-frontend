"use client";

/** DESIGN.md §9.1 — Landing. Composition only; sections live in _landing/. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "./_landing/TopNav";
import Hero from "./_landing/Hero";
import StatsBar from "./_landing/StatsBar";
import Features from "./_landing/Features";
import HowItWorks from "./_landing/HowItWorks";
import Reviews from "./_landing/Reviews";
import CtaBand from "./_landing/CtaBand";
import Footer from "./_landing/Footer";

export default function Landing() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("token")) {
      setAuthed(true);
      router.replace("/discover");
    }
  }, [router]);

  if (authed) return null;

  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <TopNav />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <Reviews />
      <CtaBand />
      <Footer />
    </div>
  );
}
