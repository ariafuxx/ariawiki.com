import { getArticleBySlug, getArticleSlugs, getArticlesBySlugSync } from "@/lib/content";
import { notFound } from "next/navigation";
import ArticleClient from "./ArticleClient";

export async function generateStaticParams() {
  const slugs = getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Not Found" };

  return {
    title: `${article.title} — ariawiki.com`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const relatedArticles = article.related
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ? getArticlesBySlugSync(article.related).map(({ content: _content, ...rest }) => rest)
    : [];

  return (
    <ArticleClient
      article={{
        slug: article.slug,
        title: article.title,
        title_zh: article.title_zh,
        description: article.description,
        description_zh: article.description_zh,
        collection: article.collection,
        tags: article.tags,
        difficulty: article.difficulty,
        status: article.status,
        date: article.date,
        updated: article.updated,
        cover: article.cover,
        source: article.source,
        language: article.language,
        reading_time: article.reading_time,
        draft: article.draft,
        related: article.related,
        html: article.html,
      }}
      relatedArticles={relatedArticles}
    />
  );
}
