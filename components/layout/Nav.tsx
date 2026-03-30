"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { Lang, t } from "@/lib/i18n";

interface NavProps {
  lang: Lang;
  onLangToggle: () => void;
}

export default function Nav({ lang, onLangToggle }: NavProps) {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrolled = scrollY > 60;

  const navLinks = [
    { label: t(lang, "library"), href: "/#library", active: true },
    { label: t(lang, "search"), href: "#", active: false },
    { label: t(lang, "dashboard"), href: "#", active: false },
    { label: t(lang, "roadmap"), href: "#", active: false },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between h-16 transition-all duration-300"
        style={{
          padding: "0 clamp(24px, 4vw, 56px)",
          background: scrolled ? "rgba(250,249,246,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(0,0,0,0.05)"
            : "1px solid transparent",
        }}
      >
        <Link href="/" data-hover className="font-mono text-[15px] font-medium text-primary cursor-none">
          ariawiki.com
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              data-hover
              className={`nav-link text-sm cursor-none ${
                link.active
                  ? "text-secondary"
                  : "text-faded pointer-events-none"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <LanguageToggle lang={lang} onToggle={onLangToggle} />
        </div>

        {/* Mobile hamburger */}
        <button
          data-hover
          className="md:hidden flex flex-col gap-1.5 cursor-none p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span
            className={`block w-5 h-[1.5px] bg-primary transition-transform ${
              mobileMenuOpen ? "rotate-45 translate-y-[4.5px]" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-primary transition-opacity ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-primary transition-transform ${
              mobileMenuOpen ? "-rotate-45 -translate-y-[4.5px]" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99] bg-offwhite pt-20 px-8 md:hidden">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-2xl font-serif ${
                  link.active ? "text-primary" : "text-faded"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4">
              <LanguageToggle lang={lang} onToggle={onLangToggle} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
