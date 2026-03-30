import Link from "next/link";
import { Article } from "@/lib/types";
import {
  COLLECTION_COLORS,
  COLLECTION_LABELS,
  DIFFICULTY_COLORS,
  STATUS_ICONS,
  COVER_GRADIENTS,
} from "@/lib/constants";
import { Lang } from "@/lib/i18n";

interface LibraryCardProps {
  article: Article;
  lang: Lang;
  index: number;
}

export default function LibraryCard({ article, lang, index }: LibraryCardProps) {
  const colColors = COLLECTION_COLORS[article.collection];
  const diffColors = DIFFICULTY_COLORS[article.difficulty];
  const coverBg = COVER_GRADIENTS[article.collection];
  const colLabel = COLLECTION_LABELS[article.collection];
  const coverLabel = article.title.split(" ").slice(0, 2).join(" ").toUpperCase();

  return (
    <Link
      href={`/library/${article.slug}`}
      data-hover
      className="card-interactive block bg-card-bg rounded-xl overflow-hidden border border-border cursor-none no-underline"
      style={{
        animation: `cardIn 0.45s cubic-bezier(.22,1,.36,1) ${index * 0.07}s both`,
      }}
    >
      {/* Cover area */}
      <div
        className="h-[172px] flex items-center justify-center relative overflow-hidden"
        style={{ background: coverBg }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "5px 5px",
          }}
        />
        <span className="font-mono text-[13px] font-medium text-white/60 tracking-widest relative">
          {coverLabel}
        </span>
      </div>

      {/* Card content */}
      <div className="px-[18px] pt-3.5 pb-[18px]">
        <span
          className="inline-block text-[11px] font-medium font-mono px-2.5 py-0.5 rounded-xl mb-2"
          style={{ background: colColors.bg, color: colColors.text }}
        >
          {colLabel}
        </span>

        <h3 className="text-[15px] font-semibold text-primary m-0 mb-1 leading-snug line-clamp-2">
          {lang === "zh" ? article.title_zh : article.title}
        </h3>

        <p className="text-[13px] text-muted m-0 mb-3 leading-snug line-clamp-1">
          {lang === "zh" ? article.description_zh : article.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[11px] font-medium font-mono px-2 py-0.5 rounded-lg capitalize"
            style={{ background: diffColors.bg, color: diffColors.text }}
          >
            {article.difficulty}
          </span>
          <span className="text-[13px]">{STATUS_ICONS[article.status]}</span>
          <span className="text-[12px] text-faded font-mono ml-auto">
            {new Date(article.date).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="text-[11px] text-faded font-mono border border-[#E0DDD6] px-1.5 py-px rounded">
            {article.language.toUpperCase()}
          </span>
        </div>
      </div>
    </Link>
  );
}
