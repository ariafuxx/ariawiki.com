"use client";

import { useState } from "react";
import FilterPills from "./FilterPills";
import LibraryCard from "./LibraryCard";
import { Article } from "@/lib/types";
import { FILTER_TO_COLLECTION } from "@/lib/constants";
import { Lang, t } from "@/lib/i18n";

interface LibrarySectionProps {
  articles: Article[];
  lang: Lang;
}

export default function LibrarySection({ articles, lang }: LibrarySectionProps) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? articles
      : articles.filter((a) => a.collection === FILTER_TO_COLLECTION[activeFilter]);

  return (
    <section
      id="library"
      className="border-t border-border max-w-[1200px] mx-auto"
      style={{ padding: "80px clamp(24px, 4vw, 56px) 120px" }}
    >
      <div className="mb-11">
        <h2 className="text-[26px] font-normal text-primary m-0 font-serif">
          {t(lang, "libraryTitle")}{" "}
          <span className="text-faded">{t(lang, "libraryTitleZh")}</span>
        </h2>
        <div className="w-10 h-0.5 bg-accent mt-3.5 rounded-sm" />
      </div>

      <div className="flex items-center justify-between mb-9 flex-wrap gap-3">
        <FilterPills activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <div className="flex items-center gap-1.5 text-[13px] text-muted font-mono">
          {t(lang, "newest")}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A9A92" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      <div className="grid gap-[22px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {filtered.map((article, i) => (
          <LibraryCard key={article.slug} article={article} lang={lang} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted">
          No articles in this collection yet.
        </div>
      )}
    </section>
  );
}
