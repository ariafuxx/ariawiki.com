"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/ui/CustomCursor";
import HeroSection from "@/components/hero/HeroSection";
import LibrarySection from "@/components/library/LibrarySection";
import { Lang } from "@/lib/i18n";
import { Article } from "@/lib/types";

type ArticleWithoutContent = Omit<Article, "content">;

interface HomeClientProps {
  articles: ArticleWithoutContent[];
}

export default function HomeClient({ articles }: HomeClientProps) {
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

  const latestArticle = articles[0]
    ? { slug: articles[0].slug, title: articles[0].title, collection: articles[0].collection }
    : undefined;

  return (
    <>
      <CustomCursor />
      <Nav lang={lang} onLangToggle={toggleLang} />
      <HeroSection lang={lang} latestArticle={latestArticle} />
      <LibrarySection articles={articles as Article[]} lang={lang} />
      <Footer lang={lang} />
    </>
  );
}
