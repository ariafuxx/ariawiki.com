import { Collection, Difficulty, Status } from "./types";

export const COLLECTION_LABELS: Record<Collection, string> = {
  papers: "Papers",
  "tech-blogs": "Tech Blogs",
  products: "Products",
  til: "TIL",
  "curated-lists": "Curated Lists",
};

export const COLLECTION_LABELS_ZH: Record<Collection, string> = {
  papers: "论文",
  "tech-blogs": "技术博客",
  products: "产品",
  til: "今日所学",
  "curated-lists": "精选列表",
};

export const COLLECTION_COLORS: Record<Collection, { bg: string; text: string }> = {
  papers: { bg: "#EEF2FF", text: "#4338CA" },
  "tech-blogs": { bg: "#FFF7ED", text: "#B45309" },
  products: { bg: "#ECFDF5", text: "#059669" },
  til: { bg: "#F5F3FF", text: "#7C3AED" },
  "curated-lists": { bg: "#FEF2F2", text: "#DC2626" },
};

export const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string }> = {
  beginner: { bg: "#ECFDF5", text: "#065F46" },
  intermediate: { bg: "#FFF7ED", text: "#92400E" },
  advanced: { bg: "#FEF2F2", text: "#991B1B" },
};

export const STATUS_ICONS: Record<Status, string> = {
  reading: "📖",
  completed: "✅",
  revisit: "🔁",
  insight: "💡",
};

export const FILTERS = ["All", "Papers", "Tech Blogs", "Products", "TIL", "Curated Lists"] as const;

export const FILTER_TO_COLLECTION: Record<string, Collection | null> = {
  All: null,
  Papers: "papers",
  "Tech Blogs": "tech-blogs",
  Products: "products",
  TIL: "til",
  "Curated Lists": "curated-lists",
};

export const COVER_GRADIENTS: Record<Collection, string> = {
  papers: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  "tech-blogs": "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #3a3a3a 100%)",
  products: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
  til: "linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)",
  "curated-lists": "linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)",
};
