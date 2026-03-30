import { Lang, t } from "@/lib/i18n";

interface FooterProps {
  lang: Lang;
}

export default function Footer({ lang }: FooterProps) {
  return (
    <footer className="border-t border-border max-w-[1200px] mx-auto" style={{ padding: "28px clamp(24px, 4vw, 56px)" }}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <span className="text-[13px] text-faded font-mono">
          {t(lang, "footer")}
        </span>
        <div className="flex gap-5">
          {["GitHub", "X", "Email"].map((link) => (
            <a
              key={link}
              data-hover
              href="#"
              className="text-[13px] text-faded no-underline font-mono cursor-none hover:text-secondary transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
