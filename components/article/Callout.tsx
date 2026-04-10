"use client";

import { ReactNode } from "react";

interface CalloutProps {
  children: ReactNode;
  type?: "insight" | "data" | "question";
}

const CALLOUT_STYLES = {
  insight: {
    bg: "#FFF8E7",
    border: "#E8A820",
  },
  data: {
    bg: "#F0F4F8",
    border: "#6B8EC2",
  },
  question: {
    bg: "#F0F8F0",
    border: "#68A868",
  },
};

export default function Callout({ children, type = "insight" }: CalloutProps) {
  const styles = CALLOUT_STYLES[type];

  return (
    <div
      className="my-6 rounded-lg"
      style={{
        background: styles.bg,
        borderLeft: `3px solid ${styles.border}`,
        padding: "0.85rem 1.25rem",
      }}
    >
      <div className="min-w-0 text-[15px] leading-relaxed" style={{ color: "#2A2A2A" }}>
        {children}
      </div>
    </div>
  );
}
