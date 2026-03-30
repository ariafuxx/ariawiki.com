"use client";

import { useState } from "react";
import Link from "next/link";

interface ViewLatestButtonProps {
  slug: string;
  title: string;
  coverBg: string;
}

export default function ViewLatestButton({ slug, title, coverBg }: ViewLatestButtonProps) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={`/library/${slug}`}
      data-hover
      className="view-button absolute right-[clamp(24px,6vw,80px)] top-[28%] hidden md:flex w-24 h-24 rounded-full bg-primary flex-col items-center justify-center gap-1 cursor-none animate-fade-in z-10"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="absolute inset-0 rounded-full overflow-hidden transition-opacity duration-400"
        style={{ background: coverBg, opacity: hover ? 1 : 0 }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "4px 4px",
          }}
        />
        <div className="absolute inset-0 bg-black/35" />
      </div>
      <span className="text-offwhite text-[11px] font-medium text-center leading-tight relative z-[1] px-2">
        {hover ? title : "View latest"}
      </span>
      <svg
        className="relative z-[1]"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FAF9F6"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M7 17L17 7M17 7H7M17 7V17" />
      </svg>
    </Link>
  );
}
