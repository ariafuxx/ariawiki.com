import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export async function renderMarkdown(content: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content);

  let html = result.toString();

  // Wrap "Core Insight" section in a styled div
  html = html.replace(
    /(<h2[^>]*>(?:Core Insight|核心洞察)<\/h2>)([\s\S]*?)(?=<h2|$)/,
    '<div class="core-insight">$1$2</div>'
  );

  return html;
}
