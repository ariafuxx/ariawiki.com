export type Collection = "papers" | "tech-blogs" | "products" | "til" | "curated-lists";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Status = "reading" | "completed" | "revisit" | "insight";

export interface ArticleFrontmatter {
  title: string;
  title_zh: string;
  description: string;
  description_zh: string;
  collection: Collection;
  tags: string[];
  difficulty: Difficulty;
  status: Status;
  date: string;
  updated?: string;
  cover?: string;
  source: string;
  language: "en" | "zh";
  reading_time: number;
  draft?: boolean;
  related?: string[];
}

export interface Article extends ArticleFrontmatter {
  slug: string;
  content: string; // raw markdown body
}

export interface ArticleWithHtml extends Article {
  html: string; // rendered HTML
}
