import Anthropic from "@anthropic-ai/sdk";
import { ArticleFrontmatter, Collection, RawItem } from "./types";
import { SYSTEM_PROMPT, COLLECTION_PROMPTS, BRIEFING_PROMPT } from "../prompts/index";

interface DraftResult {
  frontmatter: ArticleFrontmatter;
  content: string;
}

export class ClaudeClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateDraft(item: RawItem, sourceName: string): Promise<DraftResult> {
    const collection = inferCollection(sourceName);
    const collectionPrompt = COLLECTION_PROMPTS[collection] || "";

    const userMessage = `Source: ${sourceName}
Title: ${item.title}
URL: ${item.url}
Published: ${item.published_at}

Content:
${truncate(item.content || "", 6000)}

---

Generate an article draft for ariawiki.com based on the above source content. Follow the system instructions for style and structure. Output the article in this exact format:

---FRONTMATTER---
(valid YAML frontmatter)
---END_FRONTMATTER---

---CONTENT---
(markdown article body)
---END_CONTENT---`;

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT + "\n\n" + collectionPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as Anthropic.TextBlock).text)
      .join("");

    return parseDraftResponse(text, item, collection);
  }

  async generateBriefing(items: Array<{ title: string; url: string; content: string }>, date: string): Promise<string> {
    const itemsSummary = items
      .map((item, i) => `${i + 1}. **${item.title}**\n   URL: ${item.url}\n   ${truncate(item.content || "", 200)}`)
      .join("\n\n");

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: BRIEFING_PROMPT,
      messages: [{
        role: "user",
        content: `Date: ${date}\n\nItems from the last 24 hours:\n\n${itemsSummary}\n\nGenerate the daily briefing in markdown format. Include YAML frontmatter at the top.`,
      }],
    });

    return response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as Anthropic.TextBlock).text)
      .join("");
  }
}

function parseDraftResponse(text: string, item: RawItem, collection: Collection): DraftResult {
  // Extract frontmatter
  const fmMatch = text.match(/---FRONTMATTER---\s*([\s\S]*?)\s*---END_FRONTMATTER---/);
  const contentMatch = text.match(/---CONTENT---\s*([\s\S]*?)\s*---END_CONTENT---/);

  if (!fmMatch || !contentMatch) {
    // Fallback: generate minimal frontmatter
    const today = new Date().toISOString().split("T")[0];
    const frontmatter: ArticleFrontmatter = {
      title: item.title || "Untitled",
      title_zh: item.title || "无标题",
      description: truncate(item.content || "", 150),
      description_zh: truncate(item.content || "", 150),
      collection,
      tags: [],
      difficulty: "intermediate",
      status: "reading",
      date: today,
      source: item.url || "",
      language: "en",
      reading_time: 5,
      draft: true,
      related: [],
    };
    return { frontmatter, content: text };
  }

  // Parse YAML frontmatter manually (simple key-value extraction)
  const fmText = fmMatch[1];
  const frontmatter = parseYamlFrontmatter(fmText, item, collection);

  return {
    frontmatter,
    content: contentMatch[1].trim(),
  };
}

function parseYamlFrontmatter(yaml: string, item: RawItem, collection: Collection): ArticleFrontmatter {
  const get = (key: string): string => {
    const match = yaml.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, "m"));
    return match ? match[1].trim() : "";
  };

  const getArray = (key: string): string[] => {
    const match = yaml.match(new RegExp(`^${key}:\\s*\\[(.+?)\\]`, "m"));
    if (match) {
      return match[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    }
    // Multi-line array format
    const lines: string[] = [];
    const multiMatch = yaml.match(new RegExp(`^${key}:\\s*\\n((?:\\s+-\\s+.+\\n?)+)`, "m"));
    if (multiMatch) {
      multiMatch[1].split("\n").forEach((line) => {
        const m = line.match(/^\s+-\s+["']?(.+?)["']?\s*$/);
        if (m) lines.push(m[1]);
      });
    }
    return lines;
  };

  const today = new Date().toISOString().split("T")[0];

  return {
    title: get("title") || item.title || "Untitled",
    title_zh: get("title_zh") || get("title") || item.title || "无标题",
    description: get("description") || truncate(item.content || "", 150),
    description_zh: get("description_zh") || get("description") || "",
    collection: (get("collection") as Collection) || collection,
    tags: getArray("tags"),
    difficulty: (get("difficulty") as ArticleFrontmatter["difficulty"]) || "intermediate",
    status: "reading",
    date: get("date") || today,
    source: get("source") || item.url || "",
    language: (get("language") as "en" | "zh") || "en",
    reading_time: parseInt(get("reading_time")) || 5,
    draft: true,
    related: [],
  };
}

function inferCollection(sourceName: string): Collection {
  const name = sourceName.toLowerCase();
  if (name.includes("arxiv") || name.includes("paper")) return "papers";
  if (name.includes("alignment") || name.includes("lesswrong")) return "papers";
  if (name.includes("product") || name.includes("stratechery")) return "products";
  return "tech-blogs";
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}
