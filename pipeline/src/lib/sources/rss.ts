import { XMLParser } from "fast-xml-parser";
import { FeedItem, RssSourceConfig } from "../types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

export async function fetchRssFeed(config: RssSourceConfig): Promise<FeedItem[]> {
  const response = await fetch(config.url, {
    headers: {
      "User-Agent": "ariawiki-pipeline/0.1 (RSS reader)",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${config.url}: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const parsed = parser.parse(xml);

  // Handle RSS 2.0
  if (parsed.rss?.channel) {
    return parseRss2(parsed.rss.channel);
  }

  // Handle Atom
  if (parsed.feed) {
    return parseAtom(parsed.feed);
  }

  throw new Error(`Unknown feed format from ${config.url}`);
}

function parseRss2(channel: Record<string, unknown>): FeedItem[] {
  const rawItems = channel.item;
  if (!rawItems) return [];

  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return items.map((item: Record<string, unknown>) => {
    const guid = item.guid
      ? typeof item.guid === "object"
        ? (item.guid as Record<string, string>)["#text"]
        : String(item.guid)
      : String(item.link);

    return {
      id: guid || String(item.link),
      title: String(item.title || ""),
      url: String(item.link || ""),
      content: String(
        item["content:encoded"] || item.description || ""
      ),
      published: parseDate(item.pubDate as string),
    };
  });
}

function parseAtom(feed: Record<string, unknown>): FeedItem[] {
  const rawEntries = (feed as Record<string, unknown>).entry;
  if (!rawEntries) return [];

  const entries = Array.isArray(rawEntries) ? rawEntries : [rawEntries];

  return entries.map((entry: Record<string, unknown>) => {
    // Atom links can be objects or arrays of objects
    let url = "";
    const link = entry.link;
    if (Array.isArray(link)) {
      const alternate = link.find(
        (l: Record<string, string>) => l["@_rel"] === "alternate" || !l["@_rel"]
      );
      url = alternate?.["@_href"] || link[0]?.["@_href"] || "";
    } else if (typeof link === "object" && link !== null) {
      url = (link as Record<string, string>)["@_href"] || "";
    } else if (typeof link === "string") {
      url = link;
    }

    const id = entry.id ? String(entry.id) : url;

    // Content can be in content or summary
    let content = "";
    const entryContent = entry.content;
    if (typeof entryContent === "object" && entryContent !== null) {
      content = (entryContent as Record<string, string>)["#text"] || "";
    } else if (typeof entryContent === "string") {
      content = entryContent;
    } else if (entry.summary) {
      content =
        typeof entry.summary === "object"
          ? (entry.summary as Record<string, string>)["#text"] || ""
          : String(entry.summary);
    }

    return {
      id,
      title: typeof entry.title === "object"
        ? (entry.title as Record<string, string>)["#text"] || ""
        : String(entry.title || ""),
      url,
      content,
      published: parseDate(
        (entry.published || entry.updated) as string
      ),
    };
  });
}

function parseDate(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString();
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return new Date().toISOString();
  }
}
