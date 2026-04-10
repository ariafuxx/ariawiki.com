"use client";

import { useState, useEffect, useCallback } from "react";

// Configure your pipeline worker URL here
const PIPELINE_API_URL = process.env.NEXT_PUBLIC_PIPELINE_API_URL || "http://localhost:8787";
const PIPELINE_API_KEY = process.env.NEXT_PUBLIC_PIPELINE_API_KEY || "";

interface Draft {
  id: string;
  raw_item_id: string | null;
  slug: string;
  collection: string;
  frontmatter: string;
  content_md: string;
  briefing_eligible: number;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}

interface ParsedFrontmatter {
  title: string;
  title_zh: string;
  description: string;
  collection: string;
  source: string;
  date: string;
  tags: string[];
  [key: string]: unknown;
}

const COLLECTION_COLORS: Record<string, { bg: string; text: string }> = {
  papers: { bg: "#EEF2FF", text: "#4338CA" },
  "tech-blogs": { bg: "#FFF7ED", text: "#B45309" },
  products: { bg: "#ECFDF5", text: "#059669" },
  til: { bg: "#F5F3FF", text: "#7C3AED" },
  "curated-lists": { bg: "#FEF2F2", text: "#DC2626" },
};

export default function PipelineClient() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("draft");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [quickAddUrl, setQuickAddUrl] = useState("");

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${PIPELINE_API_URL}/api/drafts?status=${statusFilter}`, {
        headers: { "X-API-Key": PIPELINE_API_KEY },
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch drafts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${PIPELINE_API_URL}/api/drafts/${id}/approve`, {
        method: "POST",
        headers: { "X-API-Key": PIPELINE_API_KEY },
      });
      if (!res.ok) throw new Error("Failed to approve");
      await fetchDrafts();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${PIPELINE_API_URL}/api/drafts/${id}/reject`, {
        method: "POST",
        headers: { "X-API-Key": PIPELINE_API_KEY },
      });
      if (!res.ok) throw new Error("Failed to reject");
      await fetchDrafts();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickAdd = async () => {
    if (!quickAddUrl.trim()) return;
    try {
      const res = await fetch(`${PIPELINE_API_URL}/api/quick-add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": PIPELINE_API_KEY,
        },
        body: JSON.stringify({ url: quickAddUrl }),
      });
      if (!res.ok) throw new Error("Failed to add");
      setQuickAddUrl("");
      alert("Added to processing queue");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  const parseFrontmatter = (fm: string): ParsedFrontmatter => {
    try {
      return JSON.parse(fm);
    } catch {
      return {
        title: "Parse Error",
        title_zh: "",
        description: "",
        collection: "unknown",
        source: "",
        date: "",
        tags: [],
      };
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
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
        Content Pipeline
      </h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "32px" }}>
        Review and publish AI-generated article drafts
      </p>

      {/* Quick Add */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          padding: "16px",
          background: "#FAFAF8",
          borderRadius: "8px",
          border: "1px solid #E5E5E0",
        }}
      >
        <input
          type="text"
          placeholder="Paste a URL to process..."
          value={quickAddUrl}
          onChange={(e) => setQuickAddUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #D1D1C7",
            borderRadius: "6px",
            fontSize: "14px",
            background: "white",
          }}
        />
        <button
          onClick={handleQuickAdd}
          style={{
            padding: "8px 16px",
            background: "#1a1a1a",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      {/* Status Filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["draft", "published", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: "6px 14px",
              border: "1px solid",
              borderColor: statusFilter === status ? "#1a1a1a" : "#D1D1C7",
              background: statusFilter === status ? "#1a1a1a" : "transparent",
              color: statusFilter === status ? "white" : "#666",
              borderRadius: "20px",
              fontSize: "13px",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Loading/Error */}
      {loading && <p style={{ color: "#999" }}>Loading...</p>}
      {error && (
        <p style={{ color: "#DC2626", padding: "12px", background: "#FEF2F2", borderRadius: "8px" }}>
          {error}
        </p>
      )}

      {/* Draft List */}
      {!loading && drafts.length === 0 && (
        <p style={{ color: "#999", textAlign: "center", padding: "40px 0" }}>
          No {statusFilter} drafts
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {drafts.map((draft) => {
          const fm = parseFrontmatter(draft.frontmatter);
          const isExpanded = expandedId === draft.id;
          const colors = COLLECTION_COLORS[fm.collection] || { bg: "#F5F5F5", text: "#666" };

          return (
            <div
              key={draft.id}
              style={{
                border: "1px solid #E5E5E0",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : draft.id)}
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  background: isExpanded ? "#FAFAF8" : "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    flexShrink: 0,
                  }}
                >
                  {fm.collection}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {fm.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      margin: "2px 0 0",
                    }}
                  >
                    {fm.date} &middot; {fm.source ? new URL(fm.source).hostname : "no source"}
                  </p>
                </div>
                <span style={{ color: "#CCC", fontSize: "12px" }}>
                  {isExpanded ? "▲" : "▼"}
                </span>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid #E5E5E0" }}>
                  {/* Description */}
                  <div style={{ padding: "16px 20px", background: "#FAFAF8" }}>
                    <p style={{ fontSize: "14px", color: "#444", margin: 0 }}>
                      {fm.description}
                    </p>
                    {fm.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", marginTop: "8px", flexWrap: "wrap" }}>
                        {fm.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: "11px",
                              color: "#888",
                              background: "#EAEAE5",
                              padding: "2px 6px",
                              borderRadius: "3px",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Markdown Preview */}
                  <div
                    style={{
                      padding: "20px",
                      maxHeight: "500px",
                      overflow: "auto",
                      fontSize: "14px",
                      lineHeight: "1.7",
                      whiteSpace: "pre-wrap",
                      fontFamily: "var(--font-mono), monospace",
                      background: "white",
                    }}
                  >
                    {draft.content_md}
                  </div>

                  {/* Actions */}
                  {draft.status === "draft" && (
                    <div
                      style={{
                        padding: "12px 20px",
                        borderTop: "1px solid #E5E5E0",
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end",
                        background: "#FAFAF8",
                      }}
                    >
                      <button
                        onClick={() => handleReject(draft.id)}
                        disabled={actionLoading === draft.id}
                        style={{
                          padding: "6px 16px",
                          border: "1px solid #E5E5E0",
                          background: "white",
                          color: "#666",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                      {fm.source && (
                        <a
                          href={fm.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "6px 16px",
                            border: "1px solid #E5E5E0",
                            background: "white",
                            color: "#666",
                            borderRadius: "6px",
                            fontSize: "13px",
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          View Source
                        </a>
                      )}
                      <button
                        onClick={() => handleApprove(draft.id)}
                        disabled={actionLoading === draft.id}
                        style={{
                          padding: "6px 16px",
                          border: "none",
                          background: "#059669",
                          color: "white",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        {actionLoading === draft.id ? "Publishing..." : "Approve & Publish"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
