import { Env } from "../lib/types";
import { handleSourceFetch } from "./source-fetcher";
import { handleContentProcess } from "./content-processor";
import { handleDailyBriefing } from "./daily-briefing";
import { handleDraftApi } from "./draft-api";

export default {
  /**
   * HTTP handler: routes API requests to the draft-api.
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // API routes
    if (url.pathname.startsWith("/api/")) {
      return handleDraftApi(request, env);
    }

    // Manual trigger endpoints (for testing)
    if (url.pathname === "/trigger/fetch" && request.method === "POST") {
      const apiKey = request.headers.get("X-API-Key");
      if (apiKey !== env.PIPELINE_API_KEY) {
        return new Response("Unauthorized", { status: 401 });
      }
      const result = await handleSourceFetch(env);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/trigger/process" && request.method === "POST") {
      const apiKey = request.headers.get("X-API-Key");
      if (apiKey !== env.PIPELINE_API_KEY) {
        return new Response("Unauthorized", { status: 401 });
      }
      const result = await handleContentProcess(env);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/trigger/briefing" && request.method === "POST") {
      const apiKey = request.headers.get("X-API-Key");
      if (apiKey !== env.PIPELINE_API_KEY) {
        return new Response("Unauthorized", { status: 401 });
      }
      const result = await handleDailyBriefing(env);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  },

  /**
   * Cron handler: dispatches scheduled tasks.
   */
  async scheduled(controller: ScheduledController, env: Env): Promise<void> {
    switch (controller.cron) {
      case "*/30 * * * *":
        // Every 30 minutes: fetch sources, then process new items
        console.log("Cron: source fetch + content process");
        await handleSourceFetch(env);
        await handleContentProcess(env);
        break;

      case "0 23 * * *":
        // 23:00 UTC = 7:00 AM UTC+8: generate daily briefing
        console.log("Cron: daily briefing");
        await handleDailyBriefing(env);
        break;

      default:
        console.log(`Unknown cron: ${controller.cron}`);
    }
  },
} satisfies ExportedHandler<Env>;
