import { DB } from "../lib/db";
import { ClaudeClient } from "../lib/claude";
import { Env } from "../lib/types";

/**
 * Content Processor: processes new raw items through Claude API.
 * Generates article drafts and stores them in D1.
 * Called after source-fetcher, or on its own schedule.
 */
export async function handleContentProcess(env: Env): Promise<{ processed: number }> {
  const db = new DB(env.DB);
  const claude = new ClaudeClient(env.ANTHROPIC_API_KEY);

  // Get unprocessed items (limit to avoid timeout)
  const items = await db.getNewRawItems(5);

  if (items.length === 0) {
    console.log("No new items to process");
    return { processed: 0 };
  }

  let processed = 0;

  for (const item of items) {
    try {
      // Mark as processing
      await db.updateRawItemStatus(item.id, "processing");

      // Get source name for context
      const sources = await db.getEnabledSources();
      const source = sources.find((s) => s.id === item.source_id);
      const sourceName = source?.name || "Unknown";

      // If the content is too short (just a summary), try to fetch the full page
      let fullContent = item.content || "";
      if (fullContent.length < 500 && item.url) {
        try {
          fullContent = await fetchArticleContent(item.url);
        } catch {
          // Fall back to existing content
        }
      }

      // Update item content with full text
      const enrichedItem = { ...item, content: fullContent };

      // Generate draft via Claude
      const draft = await claude.generateDraft(enrichedItem, sourceName);

      // Generate slug from title
      const slug = generateSlug(draft.frontmatter.title);

      // Store draft
      const draftId = `draft_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      await db.insertDraft({
        id: draftId,
        raw_item_id: item.id,
        slug,
        collection: draft.frontmatter.collection,
        frontmatter: JSON.stringify(draft.frontmatter),
        content_md: draft.content,
        briefing_eligible: 1, // Default: all items eligible for briefing
        status: "draft",
      });

      // Mark raw item as drafted
      await db.updateRawItemStatus(item.id, "drafted");
      processed++;

      console.log(`Drafted: ${draft.frontmatter.title} (${slug})`);
    } catch (error) {
      console.error(`Error processing item ${item.id}:`, error);
      await db.updateRawItemStatus(item.id, "new"); // Reset for retry
    }
  }

  console.log(`Content processing complete: ${processed} drafts generated`);
  return { processed };
}

/**
 * Fetch article content from URL (basic HTML to text extraction).
 */
async function fetchArticleContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ariawiki-pipeline/0.1 (article reader)",
      Accept: "text/html",
    },
  });

  if (!response.ok) return "";

  const html = await response.text();

  // Basic HTML to text: strip tags, decode entities
  let text = html
    // Remove script and style blocks
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    // Remove nav, header, footer
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    // Convert block elements to newlines
    .replace(/<\/?(p|div|h[1-6]|br|li|tr)[^>]*>/gi, "\n")
    // Strip remaining tags
    .replace(/<[^>]+>/g, "")
    // Decode common entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Clean up whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Truncate to reasonable size for Claude input
  if (text.length > 8000) {
    text = text.slice(0, 8000) + "\n\n[Content truncated]";
  }

  return text;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
