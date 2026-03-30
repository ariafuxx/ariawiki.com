"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/ui/CustomCursor";
import { Lang, t } from "@/lib/i18n";
import {
  COLLECTION_COLORS,
  COLLECTION_LABELS,
  DIFFICULTY_COLORS,
  STATUS_ICONS,
  COVER_GRADIENTS,
} from "@/lib/constants";
import { Collection, Difficulty, Status, Article } from "@/lib/types";

type ArticleWithoutContent = Omit<Article, "content">;

interface ArticleData {
  slug: string;
  title: string;
  title_zh: string;
  description: string;
  description_zh: string;
  collection: Collection;
  tags: string[];
  difficulty: Difficulty;
  status: Status;
  date: string;
  updated?: string;
  cover?: string;
  source: string;
  language: "en" | "zh";
  reading_time: number;
  draft?: boolean;
  related?: string[];
  html: string;
}

interface ArticleClientProps {
  article: ArticleData;
  relatedArticles: ArticleWithoutContent[];
}

export default function ArticleClient({ article, relatedArticles }: ArticleClientProps) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("ariawiki-lang") as Lang | null;
    if (saved === "en" || saved === "zh") setLang(saved);
  }, []);

  const toggleLang = () => {
    const next = lang === "en" ? "zh" : "en";
    setLang(next);
    localStorage.setItem("ariawiki-lang", next);
  };

  const colColors = COLLECTION_COLORS[article.collection];
  const diffColors = DIFFICULTY_COLORS[article.difficulty];
  const coverBg = COVER_GRADIENTS[article.collection];

  return (
    <>
      <CustomCursor />
      <Nav lang={lang} onLangToggle={toggleLang} />

      <main className="pt-20 pb-20" style={{ padding: "80px clamp(24px, 4vw, 56px) 80px" }}>
        <div className="max-w-[900px] mx-auto">
          {/* Back link */}
          <Link
            href="/#library"
            data-hover
            className="text-[14px] text-secondary no-underline cursor-none hover:text-accent transition-colors inline-block mb-8"
          >
            {t(lang, "backToLibrary")}
          </Link>

          {/* Cover */}
          <div
            className="w-full rounded-xl overflow-hidden mb-8 flex items-center justify-center relative"
            style={{ background: coverBg, aspectRatio: "4/1" }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
                backgroundSize: "5px 5px",
              }}
            />
            <span className="font-mono text-lg font-medium text-white/50 tracking-widest relative">
              {article.title.split(" ").slice(0, 3).join(" ").toUpperCase()}
            </span>
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span
              className="text-[11px] font-medium font-mono px-2.5 py-0.5 rounded-xl"
              style={{ background: colColors.bg, color: colColors.text }}
            >
              {COLLECTION_LABELS[article.collection]}
            </span>
            <span
              className="text-[11px] font-medium font-mono px-2 py-0.5 rounded-lg capitalize"
              style={{ background: diffColors.bg, color: diffColors.text }}
            >
              {article.difficulty}
            </span>
            <span className="text-[13px]">{STATUS_ICONS[article.status]}</span>
            <span className="text-[12px] text-faded font-mono">
              {new Date(article.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-[12px] text-faded font-mono">
              {article.reading_time} {t(lang, "readingTime")}
            </span>
            <span className="text-[11px] text-faded font-mono border border-[#E0DDD6] px-1.5 py-px rounded">
              {article.language.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif font-normal text-primary leading-tight mb-4" style={{ fontSize: "clamp(28px, 4vw, 36px)" }}>
            {lang === "zh" ? article.title_zh : article.title}
          </h1>

          {/* Source link */}
          <a
            href={article.source}
            target="_blank"
            rel="noopener noreferrer"
            data-hover
            className="text-[13px] text-accent no-underline cursor-none hover:underline inline-flex items-center gap-1.5 mb-10"
          >
            {t(lang, "sourceLink")}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>

          {/* Article content */}
          <div
            className="article-content prose prose-lg prose-ariawiki max-w-[720px] font-sans"
            dangerouslySetInnerHTML={{ __html: article.html }}
          />

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border max-w-[720px]">
              <h2 className="font-serif text-xl text-primary mb-6">{t(lang, "relatedArticles")}</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/library/${related.slug}`}
                    data-hover
                    className="card-interactive shrink-0 w-[240px] bg-card-bg rounded-lg border border-border p-4 no-underline cursor-none"
                  >
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-xl inline-block mb-2"
                      style={{
                        background: COLLECTION_COLORS[related.collection].bg,
                        color: COLLECTION_COLORS[related.collection].text,
                      }}
                    >
                      {COLLECTION_LABELS[related.collection]}
                    </span>
                    <h3 className="text-[14px] font-medium text-primary leading-snug line-clamp-2 m-0">
                      {lang === "zh" ? related.title_zh : related.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer lang={lang} />
    </>
  );
}
