import { DB } from "../lib/db";
import { ClaudeClient } from "../lib/claude";
import { GitHubClient, formatArticleFile } from "../lib/github";
import { Env } from "../lib/types";

/**
 * Daily Briefing: runs on cron (7:00 AM UTC+8 = 23:00 UTC).
 * Aggregates the last 24 hours of briefing-eligible items,
 * generates a daily briefing via Claude, and publishes it.
 */
export async function handleDailyBriefing(env: Env): Promise<{ published: boolean }> {
  const db = new DB(env.DB);
  const claude = new ClaudeClient(env.ANTHROPIC_API_KEY);
  const github = new GitHubClient(env.GITHUB_TOKEN);

  // Today's date in UTC+8
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const today = utc8.toISOString().split("T")[0];

  // Check if briefing already exists for today
  const existing = await db.getBriefingByDate(today);
  if (existing) {
    console.log(`Briefing for ${today} already exists, skipping`);
    return { published: false };
  }

  // Get items from the last 24 hours
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const items = await db.getBriefingReadyItems(since);

  if (items.length === 0) {
    console.log("No briefing-eligible items in the last 24 hours");
    return { published: false };
  }

  console.log(`Generating briefing for ${today} with ${items.length} items`);

  // Generate briefing content via Claude
  const briefingItems = items.map((item) => ({
    title: item.title || "Untitled",
    url: item.url || "",
    content: item.content || "",
  }));

  const briefingContent = await claude.generateBriefing(briefingItems, today);

  // Commit to Git repo
  const fileName = `daily-${today}.md`;
  const filePath = `content/library/${fileName}`;

  try {
    await github.commitFile({
      repo: env.GITHUB_REPO,
      path: filePath,
      content: briefingContent,
      message: `chore: add daily briefing for ${today}`,
    });

    console.log(`Briefing committed to ${filePath}`);
  } catch (error) {
    console.error("Failed to commit briefing:", error);
    throw error;
  }

  // Record briefing in D1
  const briefingId = `brief_${today}_${Date.now().toString(36)}`;
  await db.insertBriefing({
    id: briefingId,
    date: today,
    content_md: briefingContent,
    items_included: JSON.stringify(items.map((i) => i.id)),
    published: 1,
  });

  console.log(`Daily briefing for ${today} published successfully`);
  return { published: true };
}
