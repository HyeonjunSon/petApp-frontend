"use client";

/** 랜딩 — 시안 petdate-website.html #view-landing. Composition only; sections live in _landing/. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "./_landing/TopNav";
import Hero from "./_landing/Hero";
import Features from "./_landing/Features";
import HowItWorks from "./_landing/HowItWorks";
import CtaBand from "./_landing/CtaBand";
import Footer from "./_landing/Footer";

const css = `
.ld-header{position:sticky;top:0;z-index:20;background:var(--surface);border-bottom:1px solid var(--border)}
.ld-header .in{max-width:1120px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;gap:32px}
.ld-logo{font-size:var(--fs-h1);font-weight:var(--fw-extrabold);color:var(--primary);letter-spacing:var(--ls-snug);text-decoration:none}
.ld-nav{display:flex;gap:24px}
.ld-nav a{font-size:var(--fs-body-sm);font-weight:var(--fw-semibold);color:var(--text);text-decoration:none}
.ld-nav a:hover{color:var(--primary)}
.ld-header .cta{margin-left:auto;display:flex;align-items:center;gap:10px}
.ld-header .cta .lg{font-size:var(--fs-body-sm);font-weight:var(--fw-bold);color:var(--text);padding:8px 6px;text-decoration:none}
.ld-btn-sm{background:var(--primary);color:var(--white);font-size:var(--fs-meta);font-weight:var(--fw-bold);border-radius:var(--radius-md);padding:10px 16px;display:inline-flex;align-items:center;gap:6px;text-decoration:none;transition:opacity 120ms}
.ld-btn-sm:active{opacity:.85}
.ld-hero{max-width:1120px;margin:0 auto;padding:72px 24px 88px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:center}
.ld-hero h1{font-size:46px;font-weight:var(--fw-extrabold);line-height:var(--lh-snug);letter-spacing:var(--ls-tight);color:var(--text)}
.ld-hero h1 em{font-style:normal;color:var(--primary)}
.ld-hero .sub{margin-top:18px;font-size:var(--fs-h3);font-weight:var(--fw-regular);color:var(--text-secondary);line-height:var(--lh-relaxed)}
.ld-hero .btns{margin-top:32px;display:flex;gap:12px}
.ld-btn-hero{background:var(--primary);color:var(--white);font-size:var(--fs-body);font-weight:var(--fw-bold);border-radius:var(--radius-lg);padding:15px 28px;text-decoration:none;display:inline-flex;transition:opacity 120ms}
.ld-btn-hero:active{opacity:.85}
.ld-btn-hero.ghost{background:var(--primary-10);color:var(--primary)}
.ld-hero .visual{display:flex;justify-content:center}
.ld-match{width:300px;transform:rotate(2.5deg);background:var(--surface);border-radius:var(--radius-2xl);box-shadow:var(--shadow-card-strong);overflow:hidden;display:flex;flex-direction:column}
.ld-match .ph{height:190px;background:var(--input-bg);display:grid;place-items:center;font-size:64px;position:relative}
.ld-match .dist{position:absolute;left:12px;top:12px;background:rgba(0,0,0,.45);color:var(--white);font-size:var(--fs-micro);font-weight:var(--fw-semibold);border-radius:var(--radius-pill);padding:3px 10px}
.ld-match .bd{padding:16px;flex:1}
.ld-match .nm{font-size:var(--fs-body);font-weight:var(--fw-extrabold);color:var(--text)}
.ld-match .mt{margin-top:3px;font-size:var(--fs-caption);color:var(--text-secondary)}
.ld-match .tags{margin-top:10px;display:flex;gap:6px;flex-wrap:wrap}
.ld-match .tag{display:inline-flex;background:var(--primary-10);color:var(--primary);border-radius:var(--radius-pill);padding:3px 10px;font-size:var(--fs-micro);font-weight:var(--fw-bold)}
.ld-match .acts{display:flex;gap:10px;padding:0 16px 16px}
.ld-match .acts span{flex:1;height:40px;border-radius:var(--radius-md);font-size:var(--fs-meta);font-weight:var(--fw-bold);display:inline-flex;align-items:center;justify-content:center;gap:6px}
.ld-match .pass{background:var(--input-bg);color:var(--text-secondary)}
.ld-match .like{background:var(--primary);color:var(--white)}
.ld-sect{max-width:1120px;margin:0 auto;padding:72px 24px}
.ld-sect>h2{font-size:30px;font-weight:var(--fw-extrabold);letter-spacing:var(--ls-tight);text-align:center;color:var(--text)}
.ld-sect>.lead{margin-top:10px;text-align:center;font-size:var(--fs-body);color:var(--text-secondary)}
.ld-feats{margin-top:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.ld-feat{background:var(--surface);border-radius:var(--radius-2xl);box-shadow:var(--shadow-card);padding:28px}
.ld-feat .em{width:52px;height:52px;border-radius:var(--radius-xl);background:var(--primary-10);display:grid;place-items:center;font-size:26px}
.ld-feat b{display:block;margin-top:16px;font-size:var(--fs-h3);font-weight:var(--fw-extrabold);color:var(--text)}
.ld-feat p{margin-top:6px;font-size:var(--fs-body-sm);color:var(--text-secondary);line-height:var(--lh-relaxed)}
.ld-steps{margin-top:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.ld-step{text-align:center;padding:12px}
.ld-step .no{width:44px;height:44px;border-radius:var(--radius-pill);background:var(--primary);color:var(--white);font-size:var(--fs-h3);font-weight:var(--fw-extrabold);display:grid;place-items:center;margin:0 auto}
.ld-step b{display:block;margin-top:14px;font-size:var(--fs-body);font-weight:var(--fw-bold);color:var(--text)}
.ld-step p{margin-top:4px;font-size:var(--fs-meta);color:var(--text-secondary)}
.ld-cta{max-width:1120px;margin:0 auto 80px;padding:0 24px}
.ld-cta .in{border:1px solid rgba(255,255,255,.15);border-radius:var(--radius-2xl);box-shadow:var(--shadow-banner);color:var(--white);padding:48px;text-align:center}
.ld-cta h2{font-size:28px;font-weight:var(--fw-extrabold);letter-spacing:var(--ls-tight)}
.ld-cta p{margin-top:8px;font-size:var(--fs-body);color:rgba(255,255,255,.85)}
.ld-cta a{margin-top:24px;display:inline-flex;background:var(--white);color:var(--primary);font-size:var(--fs-body);font-weight:var(--fw-bold);border-radius:var(--radius-lg);padding:14px 30px;text-decoration:none}
.ld-footer{border-top:1px solid var(--border);background:var(--surface)}
.ld-footer .in{max-width:1120px;margin:0 auto;padding:32px 24px;display:flex;align-items:center;justify-content:space-between;font-size:var(--fs-caption);color:var(--text-secondary)}
.ld-footer .links{display:flex;gap:18px}
.ld-footer a{color:var(--text-secondary);font-weight:var(--fw-semibold);text-decoration:none}
@media(max-width:900px){
  .ld-hero{grid-template-columns:1fr;padding:48px 24px}
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
    <div style={{ background: "var(--background)", color: "var(--text)" }}>
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
