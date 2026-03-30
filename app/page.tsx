import { getAllArticles } from "@/lib/content";
import HomeClient from "./HomeClient";

export default function Home() {
  const articles = getAllArticles();

  // Serialize articles for client component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const articlesData = articles.map(({ content: _content, ...rest }) => rest);

  return <HomeClient articles={articlesData} />;
}
