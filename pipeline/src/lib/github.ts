/**
 * GitHub Contents API client for committing files to the repo.
 * Used to publish articles and briefings via Git commits.
 */

interface CommitFileOptions {
  repo: string;      // "owner/repo"
  path: string;      // "content/library/my-article.md"
  content: string;   // file content (will be base64 encoded)
  message: string;   // commit message
  branch?: string;   // defaults to "main"
}

export class GitHubClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Create or update a file in the repo via GitHub Contents API.
   * If the file already exists, it will be updated (requires sha).
   */
  async commitFile(options: CommitFileOptions): Promise<{ sha: string; url: string }> {
    const { repo, path, content, message, branch = "main" } = options;
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

    // Check if file exists (need sha for updates)
    let existingSha: string | undefined;
    try {
      const checkResponse = await fetch(apiUrl + `?ref=${branch}`, {
        headers: this.headers(),
      });
      if (checkResponse.ok) {
        const existing = (await checkResponse.json()) as { sha: string };
        existingSha = existing.sha;
      }
    } catch {
      // File doesn't exist, that's fine
    }

    const body: Record<string, string> = {
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch,
    };

    if (existingSha) {
      body.sha = existingSha;
    }

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${error}`);
    }

    const result = (await response.json()) as {
      content: { sha: string; html_url: string };
    };
    return {
      sha: result.content.sha,
      url: result.content.html_url,
    };
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "ariawiki-pipeline/0.1",
    };
  }
}

/**
 * Format an article as a markdown file with YAML frontmatter.
 */
export function formatArticleFile(frontmatter: Record<string, unknown>, content: string): string {
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length === 0) return `${key}: []`;
        return `${key}:\n${value.map((v) => `  - ${JSON.stringify(v)}`).join("\n")}`;
      }
      if (typeof value === "boolean") return `${key}: ${value}`;
      if (typeof value === "number") return `${key}: ${value}`;
      if (typeof value === "string" && (value.includes(":") || value.includes("#") || value.includes('"'))) {
        return `${key}: ${JSON.stringify(value)}`;
      }
      return `${key}: ${value ?? ""}`;
    })
    .join("\n");

  return `---\n${yaml}\n---\n\n${content}\n`;
}
