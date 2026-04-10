"use client";

import { motion } from "framer-motion";

interface LightShadePair {
  lightLabel: string;
  shadeLabel: string;
  lightPct: number;
  shadePct: number;
  lightSeen: number;
  lightExpect: number;
  shadeSeen: number;
  shadeExpect: number;
  lightQuote?: string;
  lightQuoteSource?: string;
  shadeQuote?: string;
  shadeQuoteSource?: string;
}

interface LightAndShadeProps {
  pairs: LightShadePair[];
}

export default function LightAndShade({ pairs }: LightAndShadeProps) {
  if (!pairs || !Array.isArray(pairs)) return null;

  return (
    <div className="my-10 space-y-6">
      {pairs.map((pair, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: "easeOut",
          }}
          className="flex flex-col sm:flex-row items-stretch"
        >
          {/* Light / benefit column */}
          <div
            className="flex-1 p-4 rounded-lg sm:rounded-r-none border border-[#E8E6E0]"
            style={{ background: "#FFFDF5" }}
          >
            <div className="mb-3">
              <p
                className="text-[15px] font-semibold m-0"
                style={{ color: "#2A2A2A" }}
              >
                {pair.lightLabel}
              </p>
              <p
                className="text-[12px] m-0 mt-0.5"
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  color: "#999",
                }}
              >
                {pair.lightPct}% 提到这是好处
              </p>
            </div>

            {/* Segmented bar - no background, only colored segments */}
            <div className="mb-2">
              <div className="flex h-2 rounded-full overflow-hidden">
                <div
                  className="rounded-l-full"
                  style={{
                    width: `${pair.lightSeen}%`,
                    backgroundColor: "#8BA87A",
                    transition: "width 0.4s ease",
                  }}
                />
                <div
                  className="rounded-r-full"
                  style={{
                    width: `${pair.lightExpect}%`,
                    backgroundColor: "#C5D4AC",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <div className="flex gap-4 mt-1.5">
                <span
                  className="text-[11px]"
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                    color: "#8BA87A",
                  }}
                >
                  已经感受到 {pair.lightSeen}%
                </span>
                <span
                  className="text-[11px]"
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                    color: "#C5D4AC",
                  }}
                >
                  期待中 {pair.lightExpect}%
                </span>
              </div>
            </div>

            {pair.lightQuote && (
              <div className="mt-3 pt-3 border-t border-[#E8E6E0]">
                <p
                  className="text-[13px] leading-relaxed m-0"
                  style={{
                    fontStyle: "italic",
                    color: "#555",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  &ldquo;{pair.lightQuote}&rdquo;
                </p>
                {pair.lightQuoteSource && (
                  <p
                    className="mt-1 text-[10px] m-0"
                    style={{
                      fontFamily: "var(--font-dm-mono), monospace",
                      color: "#BBBBBB",
                    }}
                  >
                    -- {pair.lightQuoteSource}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Connector (desktop) */}
          <div className="hidden sm:flex items-center">
            <div
              className="w-5 h-px"
              style={{
                background:
                  "linear-gradient(90deg, #E8E6E0, #777, #E8E6E0)",
              }}
            />
          </div>
          {/* Connector (mobile) */}
          <div className="sm:hidden flex justify-center">
            <div
              className="w-px h-4"
              style={{
                background:
                  "linear-gradient(180deg, #E8E6E0, #777, #E8E6E0)",
              }}
            />
          </div>

          {/* Shade / harm column */}
          <div
            className="flex-1 p-4 rounded-lg sm:rounded-l-none"
            style={{ background: "#2A2A2A" }}
          >
            <div className="mb-3">
              <p
                className="text-[15px] font-semibold m-0"
                style={{ color: "#E8E8E8" }}
              >
                {pair.shadeLabel}
              </p>
              <p
                className="text-[12px] m-0 mt-0.5"
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  color: "#888",
                }}
              >
                {pair.shadePct}% 提到这是担忧
              </p>
            </div>

            {/* Segmented bar - no background, only colored segments */}
            <div className="mb-2">
              <div className="flex h-2 rounded-full overflow-hidden">
                <div
                  className="rounded-l-full"
                  style={{
                    width: `${pair.shadeSeen}%`,
                    backgroundColor: "#7A8B9E",
                    transition: "width 0.4s ease",
                  }}
                />
                <div
                  className="rounded-r-full"
                  style={{
                    width: `${pair.shadeExpect}%`,
                    backgroundColor: "#A5B0BC",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <div className="flex gap-4 mt-1.5">
                <span
                  className="text-[11px]"
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                    color: "#7A8B9E",
                  }}
                >
                  已经感受到 {pair.shadeSeen}%
                </span>
                <span
                  className="text-[11px]"
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                    color: "#A5B0BC",
                  }}
                >
                  担忧中 {pair.shadeExpect}%
                </span>
              </div>
            </div>

            {pair.shadeQuote && (
              <div className="mt-3 pt-3 border-t border-[#444]">
                <p
                  className="text-[13px] leading-relaxed m-0"
                  style={{
                    fontStyle: "italic",
                    color: "#CCC",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  &ldquo;{pair.shadeQuote}&rdquo;
                </p>
                {pair.shadeQuoteSource && (
                  <p
                    className="mt-1 text-[10px] m-0"
                    style={{
                      fontFamily: "var(--font-dm-mono), monospace",
                      color: "#777",
                    }}
                  >
                    -- {pair.shadeQuoteSource}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
