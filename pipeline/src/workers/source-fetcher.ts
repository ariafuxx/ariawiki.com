import { DB } from "../lib/db";
import { Env, RssSourceConfig } from "../lib/types";
import { fetchRssFeed } from "../lib/sources/rss";

/**
 * Source Fetcher: runs on cron (every 30 min).
 * Fetches RSS feeds, deduplicates, stores new items in D1.
 */
export async function handleSourceFetch(env: Env): Promise<{ fetched: number; new: number }> {
  const db = new DB(env.DB);
  const sources = await db.getEnabledSources();

  let totalFetched = 0;
  let totalNew = 0;

  for (const source of sources) {
    try {
      const config = JSON.parse(source.config);

      let items;
      switch (source.type) {
        case "rss":
          items = await fetchRssFeed(config as RssSourceConfig);
          break;
        // TODO: arxiv, twitter handlers
        default:
          console.log(`Unsupported source type: ${source.type}`);
          continue;
      }

      totalFetched += items.length;

      for (const item of items) {
        // Generate deterministic ID for dedup
        const itemId = hashId(`${source.id}:${item.id}`);

        const inserted = await db.insertRawItem({
          id: itemId,
          source_id: source.id,
          external_id: item.id,
          title: item.title,
          url: item.url,
          content: item.content,
          published_at: item.published,
        });

        if (inserted) totalNew++;
      }

      await db.updateSourceCheckedAt(source.id);
    } catch (error) {
      console.error(`Error fetching source ${source.name}:`, error);
    }
  }

  console.log(`Source fetch complete: ${totalFetched} items checked, ${totalNew} new`);
  return { fetched: totalFetched, new: totalNew };
}

/**
 * Simple hash for deterministic IDs.
 * Uses a basic string hash since crypto.subtle.digest is async
 * and we need this to be fast for dedup.
 */
function hashId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  // Convert to hex and pad
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  // Add prefix for readability
  return `ri_${hex}_${Date.now().toString(36)}`;
}
