"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChartItem {
  label: string;
  value: number;
  color: string;
  description?: string;
  quote?: string;
  quoteSource?: string;
}

interface InteractiveChartProps {
  title?: string;
  data: ChartItem[];
}

export default function InteractiveChart({ title, data }: InteractiveChartProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!data || !Array.isArray(data)) return null;

  const maxValue = Math.max(...data.map((d) => d.value));

  const handleClick = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const expandedItem = expandedIndex !== null ? data[expandedIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="my-8"
    >
      {title && (
        <p
          className="mb-3 text-[13px] font-medium"
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            color: "#888",
          }}
        >
          {title}
        </p>
      )}
      <div className="rounded-lg border border-[#E8E6E0] bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Bar chart column */}
          <div className="flex-1 min-w-0 p-4 sm:p-5">
            <div className="flex flex-col" style={{ gap: 6 }}>
              {data.map((item, index) => {
                const isExpanded = expandedIndex === index;
                const barWidthPct = (item.value / maxValue) * 100;

                return (
                  <div key={index}>
                    <button
                      type="button"
                      onClick={() => handleClick(index)}
                      className="w-full flex items-center gap-2 group text-left"
                      style={{ cursor: "pointer" }}
                    >
                      {/* Index number */}
                      <span
                        className="shrink-0 text-[11px] w-5 text-right"
                        style={{
                          fontFamily: "var(--font-dm-mono), monospace",
                          color: "#AAAAAA",
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {/* Bar container */}
                      <div className="flex-1 min-w-0 relative">
                        <div
                          className="relative flex items-center"
                          style={{
                            height: 30,
                            width: `${Math.max(barWidthPct, 15)}%`,
                            backgroundColor: item.color,
                            borderRadius: "0 4px 4px 0",
                            transition: "width 0.3s ease, opacity 0.2s ease",
                            opacity: expandedIndex !== null && !isExpanded ? 0.55 : 1,
                          }}
                        >
                          <span
                            className="px-2.5 text-[12px] font-medium truncate"
                            style={{
                              color: "#FFFFFF",
                              fontFamily: "var(--font-dm-sans), sans-serif",
                              textShadow: "0 0 4px rgba(0,0,0,0.15)",
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                      </div>

                      {/* Percentage */}
                      <span
                        className="shrink-0 text-[12px] w-12 text-right"
                        style={{
                          fontFamily: "var(--font-dm-mono), monospace",
                          color: "#888",
                        }}
                      >
                        {item.value}%
                      </span>

                      {/* Chevron */}
                      <motion.span
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0 text-[12px] w-4 text-center"
                        style={{ color: "#AAAAAA" }}
                      >
                        <ChevronIcon />
                      </motion.span>
                    </button>

                    {/* Mobile expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden sm:hidden"
                        >
                          <ExpandedContent item={item} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop expanded panel */}
          <AnimatePresence>
            {expandedItem && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden sm:block border-l border-[#E8E6E0] overflow-hidden shrink-0"
              >
                <div className="w-[320px] p-5">
                  <ExpandedContent item={expandedItem} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function ExpandedContent({ item }: { item: ChartItem }) {
  return (
    <div className="pt-3 sm:pt-0">
      {item.description && (
        <div
          className="rounded-md p-3 mb-3 text-[13px] leading-relaxed"
          style={{
            backgroundColor: "#F5F4F0",
            color: "#555",
            fontFamily: "var(--font-dm-sans), sans-serif",
          }}
        >
          {item.description}
        </div>
      )}
      {item.quote && (
        <div className="mb-1">
          <p
            className="text-[15px] leading-relaxed m-0"
            style={{
              fontStyle: "italic",
              color: "#2A2A2A",
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            &ldquo;{item.quote}&rdquo;
          </p>
          {item.quoteSource && (
            <p
              className="mt-1.5 text-[11px] m-0"
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                color: "#AAAAAA",
              }}
            >
              -- {item.quoteSource}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block" }}
    >
      <path
        d="M4.5 2.5L8 6L4.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
