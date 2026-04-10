"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface QuoteProps {
  children: ReactNode;
  source?: string;
  role?: string;
}

export default function Quote({ children, source, role }: QuoteProps) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="my-6 mx-0"
      style={{
        borderLeft: "2px solid #E8A820",
        borderRadius: "0 4px 4px 0",
        padding: "0.75rem 1.25rem",
      }}
    >
      <blockquote
        className="m-0 p-0"
        style={{
          border: "none",
          background: "none",
          fontStyle: "italic",
          fontSize: "15px",
          lineHeight: 1.7,
          color: "#4A4A4A",
        }}
      >
        {children}
      </blockquote>
      {(source || role) && (
        <figcaption
          className="mt-2 text-right"
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            fontSize: "11px",
            color: "#999",
          }}
        >
          {source && <span>{source}</span>}
          {source && role && <span> · </span>}
          {role && <span>{role}</span>}
        </figcaption>
      )}
    </motion.figure>
  );
}
