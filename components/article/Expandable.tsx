"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ExpandableProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Expandable({ title, children, defaultOpen = false }: ExpandableProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="my-6"
      style={{
        borderBottom: isOpen ? "none" : "1px solid #E8E6E0",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-0 bg-transparent border-none text-left cursor-pointer group"
        style={{ fontFamily: "inherit" }}
      >
        <span
          className="text-[15px] font-medium"
          style={{ color: "#1A1A1A" }}
        >
          {title}
        </span>
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#999"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 ml-3"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="pb-4 text-[15px] leading-relaxed" style={{ color: "#3A3A3A" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
