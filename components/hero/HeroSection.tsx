"use client";

import { useEffect, useState } from "react";
import HeroRunner from "./HeroRunner";
import HeroTextures from "./HeroTextures";
import ViewLatestButton from "./ViewLatestButton";
import { Lang, t } from "@/lib/i18n";
import { COVER_GRADIENTS } from "@/lib/constants";
import { Collection } from "@/lib/types";

interface HeroProps {
  lang: Lang;
  latestArticle?: {
    slug: string;
    title: string;
    collection: Collection;
  };
}

export default function HeroSection({ lang, latestArticle }: HeroProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className="relative overflow-hidden flex items-center"
      style={{
        height: "100vh",
        minHeight: 680,
        padding: "0 clamp(24px, 4vw, 56px)",
      }}
    >
      {/* Subtle dot texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #b8b0a0 0.7px, transparent 0.7px)",
          backgroundSize: "14px 14px",
          opacity: 0.05,
        }}
      />

      <HeroTextures />
      <HeroRunner />

      {/* Hero text */}
      <div className="relative z-10 max-w-[700px]">
        <h1 className="font-serif font-normal leading-[1.05] text-primary m-0 tracking-tight animate-hero-reveal" style={{ fontSize: "clamp(42px, 7vw, 88px)", letterSpacing: "-0.03em" }}>
          {lang === "zh" ? (
            <>
              今天我们
              <br />
              学什么<span className="text-accent">？</span>
            </>
          ) : (
            <>
              What will we
              <br />
              learn today<span className="text-accent">?</span>
            </>
          )}
        </h1>
        <p className="text-[17px] text-secondary mt-7 font-light animate-subtitle-in">
          {t(lang, "heroSubtitle")}
        </p>
        <p className="text-[15px] text-muted mt-1.5 font-light animate-subtitle-in-delayed">
          {t(lang, "heroSubtitleZh")}
        </p>
      </div>

      {/* View Latest button */}
      {latestArticle && (
        <ViewLatestButton
          slug={latestArticle.slug}
          title={latestArticle.title}
          coverBg={COVER_GRADIENTS[latestArticle.collection]}
        />
      )}

      {/* Scroll indicator - fades on scroll */}
      <div
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-fade-in-delayed z-10 transition-opacity duration-300"
        style={{ opacity: scrollY > 100 ? 0 : 1 }}
      >
        <span className="text-[11px] text-faded font-mono tracking-widest uppercase">
          {t(lang, "explore")}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B0AA9E" strokeWidth="1.5">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
