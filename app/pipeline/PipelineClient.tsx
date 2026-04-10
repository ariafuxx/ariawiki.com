"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editFrontmatter, setEditFrontmatter] = useState("");
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");

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
      // Save edits first if in edit mode
      if (editingId === id) {
        await saveEdits(id);
      }
      const res = await fetch(`${PIPELINE_API_URL}/api/drafts/${id}/approve`, {
        method: "POST",
        headers: { "X-API-Key": PIPELINE_API_KEY },
      });
      if (!res.ok) throw new Error("Failed to approve");
      setEditingId(null);
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
      setEditingId(null);
      await fetchDrafts();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setActionLoading(null);
    }
  };

  const startEditing = (draft: Draft) => {
    setEditingId(draft.id);
    setEditContent(draft.content_md);
    setEditFrontmatter(draft.frontmatter);
    setViewMode("edit");
  };

  const saveEdits = async (id: string) => {
    try {
      const res = await fetch(`${PIPELINE_API_URL}/api/drafts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": PIPELINE_API_KEY,
        },
        body: JSON.stringify({
          frontmatter: editFrontmatter,
          content_md: editContent,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      // Update local state
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, content_md: editContent, frontmatter: editFrontmatter } : d
        )
      );
      setViewMode("preview");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error saving");
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
      return { title: "Parse Error", title_zh: "", description: "", collection: "unknown", source: "", date: "", tags: [] };
    }
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px", fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
      <h1 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: "32px", fontWeight: 400, marginBottom: "8px" }}>
        Content Pipeline
      </h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "32px" }}>
        Review and publish AI-generated article drafts
      </p>

      {/* Quick Add */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", padding: "16px", background: "#FAFAF8", borderRadius: "8px", border: "1px solid #E5E5E0" }}>
        <input
          type="text"
          placeholder="Paste a URL to process..."
          value={quickAddUrl}
          onChange={(e) => setQuickAddUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #D1D1C7", borderRadius: "6px", fontSize: "14px", background: "white" }}
        />
        <button onClick={handleQuickAdd} style={{ padding: "8px 16px", background: "#1a1a1a", color: "white", border: "none", borderRadius: "6px", fontSize: "14px", cursor: "pointer" }}>
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

      {loading && <p style={{ color: "#999" }}>Loading...</p>}
      {error && <p style={{ color: "#DC2626", padding: "12px", background: "#FEF2F2", borderRadius: "8px" }}>{error}</p>}
      {!loading && drafts.length === 0 && <p style={{ color: "#999", textAlign: "center", padding: "40px 0" }}>No {statusFilter} drafts</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {drafts.map((draft) => {
          const fm = parseFrontmatter(editingId === draft.id ? editFrontmatter : draft.frontmatter);
          const isExpanded = expandedId === draft.id;
          const isEditing = editingId === draft.id;
          const colors = COLLECTION_COLORS[fm.collection] || { bg: "#F5F5F5", text: "#666" };
          const currentContent = isEditing ? editContent : draft.content_md;

          return (
            <div key={draft.id} style={{ border: "1px solid #E5E5E0", borderRadius: "8px", overflow: "hidden" }}>
              {/* Header */}
              <div
                onClick={() => { setExpandedId(isExpanded ? null : draft.id); if (!isExpanded) setViewMode("preview"); }}
                style={{ padding: "16px 20px", cursor: "pointer", background: isExpanded ? "#FAFAF8" : "white", display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{ background: colors.bg, color: colors.text, padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0 }}>
                  {fm.collection}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {fm.title}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#999", margin: "2px 0 0" }}>
                    {fm.date}
                    {fm.source && (() => { try { return ` · ${new URL(fm.source).hostname}`; } catch { return ""; } })()}
                  </p>
                </div>
                <span style={{ color: "#CCC", fontSize: "12px" }}>{isExpanded ? "▲" : "▼"}</span>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid #E5E5E0" }}>
                  {/* Tags */}
                  <div style={{ padding: "12px 20px", background: "#FAFAF8" }}>
                    <p style={{ fontSize: "14px", color: "#444", margin: "0 0 6px" }}>{fm.description}</p>
                    {fm.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {fm.tags.map((tag) => (
                          <span key={tag} style={{ fontSize: "11px", color: "#888", background: "#EAEAE5", padding: "2px 6px", borderRadius: "3px" }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* View Mode Toggle */}
                  {draft.status === "draft" && (
                    <div style={{ padding: "8px 20px", borderTop: "1px solid #E5E5E0", borderBottom: "1px solid #E5E5E0", display: "flex", gap: "4px", background: "#FAFAF8" }}>
                      <button
                        onClick={() => { setViewMode("preview"); }}
                        style={{
                          padding: "4px 12px", border: "1px solid", fontSize: "12px", cursor: "pointer", borderRadius: "4px",
                          borderColor: viewMode === "preview" ? "#1a1a1a" : "#D1D1C7",
                          background: viewMode === "preview" ? "#1a1a1a" : "white",
                          color: viewMode === "preview" ? "white" : "#666",
                        }}
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => { startEditing(draft); }}
                        style={{
                          padding: "4px 12px", border: "1px solid", fontSize: "12px", cursor: "pointer", borderRadius: "4px",
                          borderColor: viewMode === "edit" && isEditing ? "#1a1a1a" : "#D1D1C7",
                          background: viewMode === "edit" && isEditing ? "#1a1a1a" : "white",
                          color: viewMode === "edit" && isEditing ? "white" : "#666",
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  )}

                  {/* Content Area */}
                  {viewMode === "edit" && isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{
                          width: "100%",
                          minHeight: "500px",
                          padding: "20px",
                          border: "none",
                          borderBottom: "1px solid #E5E5E0",
                          fontSize: "14px",
                          lineHeight: "1.7",
                          fontFamily: "var(--font-mono), monospace",
                          resize: "vertical",
                          outline: "none",
                          background: "white",
                          boxSizing: "border-box",
                        }}
                      />
                      <div style={{ padding: "8px 20px", background: "#FAFAF8", display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => saveEdits(draft.id)}
                          style={{ padding: "6px 16px", background: "#2563EB", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}
                        >
                          Save Edits
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="prose prose-sm max-w-none"
                      style={{
                        padding: "20px",
                        maxHeight: "600px",
                        overflow: "auto",
                        fontSize: "15px",
                        lineHeight: "1.8",
                        background: "white",
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          h2: ({ children }) => (
                            <h2 style={{ fontSize: "20px", fontWeight: 600, margin: "28px 0 12px", fontFamily: "var(--font-serif), Georgia, serif" }}>{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 style={{ fontSize: "17px", fontWeight: 600, margin: "20px 0 8px" }}>{children}</h3>
                          ),
                          p: ({ children }) => (
                            <p style={{ margin: "0 0 14px", color: "#333" }}>{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul style={{ margin: "0 0 14px", paddingLeft: "20px" }}>{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol style={{ margin: "0 0 14px", paddingLeft: "20px" }}>{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li style={{ margin: "0 0 6px", color: "#333" }}>{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong style={{ fontWeight: 600, color: "#1a1a1a" }}>{children}</strong>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote style={{ borderLeft: "3px solid #E5C07B", paddingLeft: "16px", margin: "16px 0", color: "#555", fontStyle: "italic" }}>{children}</blockquote>
                          ),
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#2563EB", textDecoration: "underline" }}>{children}</a>
                          ),
                          code: ({ children }) => (
                            <code style={{ background: "#F3F4F6", padding: "2px 5px", borderRadius: "3px", fontSize: "13px" }}>{children}</code>
                          ),
                        }}
                      >
                        {currentContent}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Actions */}
                  {draft.status === "draft" && (
                    <div style={{ padding: "12px 20px", borderTop: "1px solid #E5E5E0", display: "flex", gap: "8px", justifyContent: "flex-end", background: "#FAFAF8" }}>
                      <button
                        onClick={() => handleReject(draft.id)}
                        disabled={actionLoading === draft.id}
                        style={{ padding: "6px 16px", border: "1px solid #E5E5E0", background: "white", color: "#666", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}
                      >
                        Reject
                      </button>
                      {fm.source && (
                        <a href={fm.source} target="_blank" rel="noopener noreferrer"
                          style={{ padding: "6px 16px", border: "1px solid #E5E5E0", background: "white", color: "#666", borderRadius: "6px", fontSize: "13px", textDecoration: "none", display: "inline-block" }}>
                          View Source
                        </a>
                      )}
                      <button
                        onClick={() => handleApprove(draft.id)}
                        disabled={actionLoading === draft.id}
                        style={{ padding: "6px 16px", border: "none", background: "#059669", color: "white", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}
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
