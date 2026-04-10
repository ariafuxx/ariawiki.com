import { DB } from "../lib/db";
import { GitHubClient, formatArticleFile } from "../lib/github";
import { Env, ArticleFrontmatter } from "../lib/types";

/**
 * Draft API: HTTP endpoints for the review interface.
 *
 * GET  /api/drafts           - List all drafts (optionally filter by status)
 * GET  /api/drafts/:id       - Get single draft
 * POST /api/drafts/:id/approve  - Approve and publish a draft
 * POST /api/drafts/:id/reject   - Reject a draft
 * PUT  /api/drafts/:id       - Update draft content
 * POST /api/quick-add        - Manually add a URL for processing
 */
export async function handleDraftApi(request: Request, env: Env): Promise<Response> {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth check
  const apiKey = request.headers.get("X-API-Key");
  if (apiKey !== env.PIPELINE_API_KEY) {
    return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
  }

  const url = new URL(request.url);
  const path = url.pathname;
  const db = new DB(env.DB);

  try {
    // GET /api/drafts
    if (path === "/api/drafts" && request.method === "GET") {
      const status = url.searchParams.get("status") || "draft";
      const drafts = await db.getDraftsByStatus(status);
      return jsonResponse({ drafts }, 200, corsHeaders);
    }

    // GET /api/drafts/:id
    const draftMatch = path.match(/^\/api\/drafts\/([^/]+)$/);
    if (draftMatch && request.method === "GET") {
      const draft = await db.getDraftById(draftMatch[1]);
      if (!draft) return jsonResponse({ error: "Not found" }, 404, corsHeaders);
      return jsonResponse({ draft }, 200, corsHeaders);
    }

    // POST /api/drafts/:id/approve
    const approveMatch = path.match(/^\/api\/drafts\/([^/]+)\/approve$/);
    if (approveMatch && request.method === "POST") {
      const draft = await db.getDraftById(approveMatch[1]);
      if (!draft) return jsonResponse({ error: "Not found" }, 404, corsHeaders);

      // Parse and update frontmatter
      const frontmatter: ArticleFrontmatter = JSON.parse(draft.frontmatter);
      frontmatter.draft = false;
      frontmatter.status = "completed";

      // Commit to GitHub
      const github = new GitHubClient(env.GITHUB_TOKEN);
      const fileContent = formatArticleFile(frontmatter as unknown as Record<string, unknown>, draft.content_md);

      await github.commitFile({
        repo: env.GITHUB_REPO,
        path: `content/library/${draft.slug}.md`,
        content: fileContent,
        message: `feat: publish article "${frontmatter.title}"`,
      });

      // Update draft status
      await db.updateDraftStatus(draft.id, "published");

      return jsonResponse({ message: "Published", slug: draft.slug }, 200, corsHeaders);
    }

    // POST /api/drafts/:id/reject
    const rejectMatch = path.match(/^\/api\/drafts\/([^/]+)\/reject$/);
    if (rejectMatch && request.method === "POST") {
      await db.updateDraftStatus(rejectMatch[1], "rejected");
      return jsonResponse({ message: "Rejected" }, 200, corsHeaders);
    }

    // PUT /api/drafts/:id (update content)
    const updateMatch = path.match(/^\/api\/drafts\/([^/]+)$/);
    if (updateMatch && request.method === "PUT") {
      const body = (await request.json()) as { frontmatter?: string; content_md?: string };
      const draft = await db.getDraftById(updateMatch[1]);
      if (!draft) return jsonResponse({ error: "Not found" }, 404, corsHeaders);

      await db.updateDraftContent(
        draft.id,
        body.frontmatter || draft.frontmatter,
        body.content_md || draft.content_md
      );

      return jsonResponse({ message: "Updated" }, 200, corsHeaders);
    }

    // POST /api/quick-add (manual URL submission)
    if (path === "/api/quick-add" && request.method === "POST") {
      const body = (await request.json()) as { url: string; title?: string };
      if (!body.url) return jsonResponse({ error: "URL required" }, 400, corsHeaders);

      const itemId = `qa_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      await db.insertRawItem({
        id: itemId,
        source_id: "quick-add",
        external_id: body.url,
        title: body.title || null,
        url: body.url,
        content: null,
        published_at: new Date().toISOString(),
      });

      return jsonResponse({ message: "Added to queue", id: itemId }, 200, corsHeaders);
    }

    // GET /api/sources (list sources)
    if (path === "/api/sources" && request.method === "GET") {
      const sources = await db.getEnabledSources();
      return jsonResponse({ sources }, 200, corsHeaders);
    }

    return jsonResponse({ error: "Not found" }, 404, corsHeaders);
  } catch (error) {
    console.error("Draft API error:", error);
    return jsonResponse({ error: "Internal server error" }, 500, corsHeaders);
  }
}

function jsonResponse(data: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}
