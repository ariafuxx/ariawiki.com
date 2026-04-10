import { Source, RawItem, Draft, Briefing } from "./types";

export class DB {
  constructor(private d1: D1Database) {}

  // --- Sources ---

  async getEnabledSources(): Promise<Source[]> {
    const result = await this.d1
      .prepare("SELECT * FROM sources WHERE enabled = 1")
      .all<Source>();
    return result.results;
  }

  async updateSourceCheckedAt(sourceId: string): Promise<void> {
    await this.d1
      .prepare("UPDATE sources SET last_checked_at = datetime('now') WHERE id = ?")
      .bind(sourceId)
      .run();
  }

  // --- Raw Items ---

  async insertRawItem(item: Omit<RawItem, "fetched_at" | "status">): Promise<boolean> {
    try {
      await this.d1
        .prepare(
          `INSERT INTO raw_items (id, source_id, external_id, title, url, content, published_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(item.id, item.source_id, item.external_id, item.title, item.url, item.content, item.published_at)
        .run();
      return true;
    } catch (e: unknown) {
      // Duplicate key = already seen
      if (e instanceof Error && e.message.includes("UNIQUE")) return false;
      throw e;
    }
  }

  async getNewRawItems(limit = 10): Promise<RawItem[]> {
    const result = await this.d1
      .prepare("SELECT * FROM raw_items WHERE status = 'new' ORDER BY fetched_at ASC LIMIT ?")
      .bind(limit)
      .all<RawItem>();
    return result.results;
  }

  async updateRawItemStatus(id: string, status: string): Promise<void> {
    await this.d1
      .prepare("UPDATE raw_items SET status = ? WHERE id = ?")
      .bind(status, id)
      .run();
  }

  // --- Drafts ---

  async insertDraft(draft: Omit<Draft, "created_at" | "reviewed_at">): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO drafts (id, raw_item_id, slug, collection, frontmatter, content_md, briefing_eligible, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        draft.id, draft.raw_item_id, draft.slug, draft.collection,
        draft.frontmatter, draft.content_md, draft.briefing_eligible, draft.status
      )
      .run();
  }

  async getDraftsByStatus(status: string): Promise<Draft[]> {
    const result = await this.d1
      .prepare("SELECT * FROM drafts WHERE status = ? ORDER BY created_at DESC")
      .bind(status)
      .all<Draft>();
    return result.results;
  }

  async getDraftById(id: string): Promise<Draft | null> {
    const result = await this.d1
      .prepare("SELECT * FROM drafts WHERE id = ?")
      .bind(id)
      .first<Draft>();
    return result;
  }

  async updateDraftStatus(id: string, status: string): Promise<void> {
    await this.d1
      .prepare("UPDATE drafts SET status = ?, reviewed_at = datetime('now') WHERE id = ?")
      .bind(status, id)
      .run();
  }

  async updateDraftContent(id: string, frontmatter: string, contentMd: string): Promise<void> {
    await this.d1
      .prepare("UPDATE drafts SET frontmatter = ?, content_md = ? WHERE id = ?")
      .bind(frontmatter, contentMd, id)
      .run();
  }

  // --- Briefings ---

  async getBriefingReadyItems(since: string): Promise<RawItem[]> {
    const result = await this.d1
      .prepare(
        `SELECT ri.* FROM raw_items ri
         JOIN drafts d ON d.raw_item_id = ri.id
         WHERE d.briefing_eligible = 1 AND ri.fetched_at > ?
         ORDER BY ri.published_at DESC`
      )
      .bind(since)
      .all<RawItem>();
    return result.results;
  }

  async insertBriefing(briefing: Omit<Briefing, "created_at">): Promise<void> {
    await this.d1
      .prepare(
        `INSERT INTO briefings (id, date, content_md, items_included, published)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(briefing.id, briefing.date, briefing.content_md, briefing.items_included, briefing.published)
      .run();
  }

  async getBriefingByDate(date: string): Promise<Briefing | null> {
    return await this.d1
      .prepare("SELECT * FROM briefings WHERE date = ?")
      .bind(date)
      .first<Briefing>();
  }
}
