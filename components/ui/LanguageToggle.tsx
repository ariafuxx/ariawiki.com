"use client";

import { Lang } from "@/lib/i18n";

interface LanguageToggleProps {
  lang: Lang;
  onToggle: () => void;
}

export default function LanguageToggle({ lang, onToggle }: LanguageToggleProps) {
  return (
    <button
      data-hover
      onClick={onToggle}
      className="text-xs text-secondary bg-transparent border border-[#d4d0c8] rounded-full px-3.5 py-1 font-mono cursor-none"
    >
      {lang === "en" ? "中文" : "EN"}
    </button>
  );
}
