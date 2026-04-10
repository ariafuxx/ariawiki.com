import { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Daily Briefing | Aria Wiki",
  description: "Daily AI briefings curated by Aria Wiki",
};

export default function DailyPage() {
  const allArticles = getAllArticles();
  const briefings = allArticles
    .filter((a) => a.tags.includes("daily-briefing"))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "40px 24px",
        fontFamily: "var(--font-sans), system-ui, sans-serif",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: "32px",
          fontWeight: 400,
          marginBottom: "8px",
        }}
      >
        Daily Briefing
      </h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "40px" }}>
        AI world highlights, delivered daily
      </p>

      {briefings.length === 0 && (
        <p style={{ color: "#999", textAlign: "center", padding: "40px 0" }}>
          No briefings yet. The first one will appear once the pipeline is running.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {briefings.map((briefing) => {
          const date = new Date(briefing.date);
          const formattedDate = date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <Link
              key={briefing.slug}
              href={`/library/${briefing.slug}`}
              style={{
                display: "block",
                padding: "20px 24px",
                border: "1px solid #E5E5E0",
                borderRadius: "8px",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.2s",
              }}
            >
              <time
                style={{
                  fontSize: "12px",
                  color: "#999",
                  fontFamily: "var(--font-mono), monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {formattedDate}
              </time>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  margin: "6px 0 4px",
                  fontFamily: "var(--font-serif), Georgia, serif",
                }}
              >
                {briefing.title}
              </h2>
              <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                {briefing.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
