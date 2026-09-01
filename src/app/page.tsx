"use client";

/** 랜딩 — Offleash 디자인 v2. Composition only; sections live in _landing/. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "./_landing/TopNav";
import Hero from "./_landing/Hero";
import Features from "./_landing/Features";
import HowItWorks from "./_landing/HowItWorks";
import CtaBand from "./_landing/CtaBand";
import Footer from "./_landing/Footer";

const css = `
.ld-header{position:sticky;top:0;z-index:20;background:var(--surface);border-bottom:1px solid var(--line)}
.ld-header .in{max-width:1120px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;gap:32px}
.ld-nav{display:flex;gap:24px}
.ld-nav a{font-size:15px;font-weight:600;color:var(--ink);text-decoration:none}
.ld-nav a:hover{color:var(--fence)}
.ld-header .cta{margin-left:auto;display:flex;align-items:center;gap:12px}
.ld-header .cta .lg{font-size:15px;font-weight:600;color:var(--ink);padding:8px 6px;text-decoration:none}
.ld-hero{max-width:1120px;margin:0 auto;padding:72px 24px 96px;display:grid;grid-template-columns:1.1fr .9fr;gap:48px;align-items:center}
.ld-hero h1{font-size:52px}
.ld-hero h1 em{font-style:normal;display:inline-block;background:var(--ball);color:var(--ball-ink);padding:2px 16px 6px;border-radius:999px;transform:rotate(-1.5deg)}
.ld-hero .sub{margin-top:20px;font-size:18px;color:var(--fence);line-height:var(--lh-relaxed);max-width:42ch}
.ld-hero .btns{margin-top:32px;display:flex;gap:12px;flex-wrap:wrap}
.ld-hero .visual{display:flex;justify-content:center;padding:0 24px 84px 0}
.ld-stack{position:relative;width:320px}
.ld-shot{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-card);overflow:hidden;transform:rotate(2deg)}
.ld-shot img{width:100%;height:210px;object-fit:cover;display:block}
.ld-shot .bd{padding:14px 16px 16px}
.ld-shot .nm{font-family:var(--font-display);font-weight:700;font-size:20px;letter-spacing:-.02em;display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.ld-shot .nm small{font-family:var(--font-body);font-size:13px;font-weight:600;background:var(--ball);color:var(--ball-ink);padding:2px 8px;border-radius:999px;white-space:nowrap}
.ld-shot .mt{margin-top:2px;font-size:13px;color:var(--fence)}
.ld-shot .tags{margin-top:10px;display:flex;gap:6px;flex-wrap:wrap}
.ld-walk{position:absolute;left:-56px;bottom:-76px;width:230px;transform:rotate(-3deg);border:1px solid var(--line)}
.ld-sect{max-width:1120px;margin:0 auto;padding:72px 24px}
.ld-sect>h2{font-size:32px;text-align:center}
.ld-sect>.lead{margin-top:12px;text-align:center;font-size:15px;color:var(--fence)}
.ld-feats{margin-top:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.ld-feat{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-card);padding:28px}
.ld-feat .em{width:52px;height:52px;border-radius:14px;background:var(--paper);border:1px solid var(--line);display:grid;place-items:center;font-size:24px}
.ld-feat b{display:block;margin-top:16px;font-family:var(--font-display);font-size:19px;font-weight:700;letter-spacing:-.01em;color:var(--ink)}
.ld-feat p{margin-top:6px;font-size:15px;color:var(--fence);line-height:var(--lh-relaxed)}
.ld-steps{margin-top:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.ld-step{text-align:center;padding:12px}
.ld-step .no{width:44px;height:44px;border-radius:999px;background:var(--ball);color:var(--ball-ink);border:2px solid var(--ink);font-family:var(--font-display);font-size:19px;font-weight:700;display:grid;place-items:center;margin:0 auto}
.ld-step b{display:block;margin-top:14px;font-size:16px;font-weight:600;color:var(--ink)}
.ld-step p{margin-top:4px;font-size:14px;color:var(--fence)}
.ld-cta{max-width:1120px;margin:0 auto 80px;padding:0 24px}
.ld-cta .in{background:var(--ball);color:var(--ball-ink);border-radius:var(--radius-card);padding:56px 48px;text-align:center}
.ld-cta h2{font-size:30px;color:var(--ball-ink)}
.ld-cta p{margin-top:10px;font-size:15px;opacity:.8}
.ld-cta .in .btn{margin-top:24px}
.ld-footer{border-top:1px solid var(--line);background:var(--surface)}
.ld-footer .in{max-width:1120px;margin:0 auto;padding:32px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:13px;color:var(--fence)}
.ld-footer .links{display:flex;gap:18px}
.ld-footer a{color:var(--fence);font-weight:600;text-decoration:none}
@media(max-width:900px){
  .ld-hero{grid-template-columns:1fr;padding:48px 24px}
  .ld-hero h1{font-size:40px}
  .ld-hero .visual{display:none}
  .ld-feats,.ld-steps{grid-template-columns:1fr}
  .ld-nav{display:none}
}
`;

export default function Landing() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("token")) {
      setAuthed(true);
      router.replace("/home");
    }
  }, [router]);

  if (authed) return null;

  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TopNav />
      <Hero />
      <Features />
      <HowItWorks />
      <CtaBand />
      <Footer />
    </div>
  );
}
