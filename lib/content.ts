import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Article, ArticleFrontmatter, ArticleWithHtml } from "./types";
import { renderMarkdown } from "./markdown";

const contentDirectory = path.join(process.cwd(), "content/library");

/**
 * Resolve the file path for a slug, preferring .mdx over .md.
 * Returns { filePath, isMdx } or null if neither exists.
 */
function resolveArticleFile(slug: string): { filePath: string; isMdx: boolean } | null {
  const mdxPath = path.join(contentDirectory, `${slug}.mdx`);
  if (fs.existsSync(mdxPath)) return { filePath: mdxPath, isMdx: true };

  const mdPath = path.join(contentDirectory, `${slug}.md`);
  if (fs.existsSync(mdPath)) return { filePath: mdPath, isMdx: false };

  return null;
}

export function getAllArticles(): Article[] {
  const files = fs
    .readdirSync(contentDirectory)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  const articles = files
    .map((filename) => {
      const slug = filename.replace(/\.mdx?$/, "");
      const filePath = path.join(contentDirectory, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);
      const frontmatter = data as ArticleFrontmatter;

      if (frontmatter.draft) return null;

      return {
        slug,
        content,
        ...frontmatter,
      } as Article;
    })
    .filter((a): a is Article => a !== null);

  // Deduplicate: if both .md and .mdx exist for same slug, keep .mdx
  const seen = new Map<string, Article>();
  for (const article of articles) {
    const existing = seen.get(article.slug);
    if (!existing) {
      seen.set(article.slug, article);
    }
    // .mdx files come after .md alphabetically, so last one wins (which is .mdx)
  }

  const deduped = Array.from(seen.values());

  // Sort by date descending
  deduped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return deduped;
}

export function getArticleSlugs(): string[] {
  const files = fs
    .readdirSync(contentDirectory)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  // Deduplicate slugs
  const slugs = new Set(files.map((f) => f.replace(/\.mdx?$/, "")));
  return Array.from(slugs);
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithHtml | null> {
  const resolved = resolveArticleFile(slug);
  if (!resolved) return null;

  const { filePath, isMdx } = resolved;
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const frontmatter = data as ArticleFrontmatter;

  if (isMdx) {
    // For .mdx files, return raw MDX content (serialization happens in page.tsx)
    return {
      slug,
      content,
      html: "", // empty since we use MDX rendering
      mdx: content,
      ...frontmatter,
    };
  }

  // For .md files, use the remark pipeline
  const html = await renderMarkdown(content);
  return {
    slug,
    content,
    html,
    ...frontmatter,
  };
}

export function getArticlesBySlugSync(slugs: string[]): Article[] {
  return slugs
    .map((slug) => {
      const resolved = resolveArticleFile(slug);
      if (!resolved) return null;
      const fileContent = fs.readFileSync(resolved.filePath, "utf-8");
      const { data, content } = matter(fileContent);
      return { slug, content, ...(data as ArticleFrontmatter) } as Article;
    })
    .filter((a): a is Article => a !== null);
}
