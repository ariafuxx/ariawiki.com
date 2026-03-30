"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/ui/CustomCursor";
import { Lang } from "@/lib/i18n";

interface AppShellProps {
  children: (lang: Lang) => React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
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

  return (
    <>
      <CustomCursor />
      <Nav lang={lang} onLangToggle={toggleLang} />
      {children(lang)}
      <Footer lang={lang} />
    </>
  );
}
