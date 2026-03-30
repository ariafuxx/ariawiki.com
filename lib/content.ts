import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Article, ArticleFrontmatter, ArticleWithHtml } from "./types";
import { renderMarkdown } from "./markdown";

const contentDirectory = path.join(process.cwd(), "content/library");

export function getAllArticles(): Article[] {
  const files = fs.readdirSync(contentDirectory).filter((f) => f.endsWith(".md"));

  const articles = files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
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

  // Sort by date descending
  articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return articles;
}

export function getArticleSlugs(): string[] {
  return fs
    .readdirSync(contentDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithHtml | null> {
  const filePath = path.join(contentDirectory, `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const frontmatter = data as ArticleFrontmatter;
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
      const filePath = path.join(contentDirectory, `${slug}.md`);
      if (!fs.existsSync(filePath)) return null;
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);
      return { slug, content, ...(data as ArticleFrontmatter) } as Article;
    })
    .filter((a): a is Article => a !== null);
}
