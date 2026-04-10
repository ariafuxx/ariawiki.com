// Cloudflare bindings
export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  ANTHROPIC_API_KEY: string;
  GITHUB_TOKEN: string;
  PIPELINE_API_KEY: string;
  GITHUB_REPO: string;
  ENVIRONMENT: string;
}

// Source types
export type SourceType = "rss" | "arxiv" | "twitter";

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  config: string; // JSON
  enabled: number;
  last_checked_at: string | null;
  created_at: string;
}

export interface RssSourceConfig {
  url: string;
}

export interface ArxivSourceConfig {
  categories: string[];
  keywords: string[];
  max_results: number;
}

// Raw items from sources
export type RawItemStatus = "new" | "processing" | "drafted" | "skipped";

export interface RawItem {
  id: string;
  source_id: string;
  external_id: string;
  title: string | null;
  url: string | null;
  content: string | null;
  published_at: string | null;
  fetched_at: string;
  status: RawItemStatus;
}

// Drafts
export type DraftStatus = "draft" | "approved" | "published" | "rejected";

export interface Draft {
  id: string;
  raw_item_id: string | null;
  slug: string;
  collection: string;
  frontmatter: string; // JSON
  content_md: string;
  briefing_eligible: number;
  status: DraftStatus;
  created_at: string;
  reviewed_at: string | null;
}

// Briefings
export interface Briefing {
  id: string;
  date: string;
  content_md: string;
  items_included: string; // JSON array
  published: number;
  created_at: string;
}

// Parsed feed item (from RSS/Atom)
export interface FeedItem {
  id: string;       // guid or link
  title: string;
  url: string;
  content: string;  // description or content:encoded
  published: string; // ISO date
}

// Article frontmatter (must match ariawiki lib/types.ts)
export type Collection = "papers" | "tech-blogs" | "products" | "til" | "curated-lists";

export interface ArticleFrontmatter {
  title: string;
  title_zh: string;
  description: string;
  description_zh: string;
  collection: Collection;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "reading" | "completed" | "revisit" | "insight";
  date: string;
  updated?: string;
  cover?: string;
  source: string;
  language: "en" | "zh";
  reading_time: number;
  draft: boolean;
  related?: string[];
}
