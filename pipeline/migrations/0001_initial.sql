-- Sources to monitor
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  last_checked_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Raw fetched items
CREATE TABLE IF NOT EXISTS raw_items (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  external_id TEXT NOT NULL,
  title TEXT,
  url TEXT,
  content TEXT,
  published_at TEXT,
  fetched_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'new',
  FOREIGN KEY (source_id) REFERENCES sources(id)
);

CREATE INDEX IF NOT EXISTS idx_raw_items_status ON raw_items(status);
CREATE INDEX IF NOT EXISTS idx_raw_items_source ON raw_items(source_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_raw_items_dedup ON raw_items(source_id, external_id);

-- AI-generated drafts
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  raw_item_id TEXT,
  slug TEXT NOT NULL,
  collection TEXT NOT NULL,
  frontmatter TEXT NOT NULL,
  content_md TEXT NOT NULL,
  briefing_eligible INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT (datetime('now')),
  reviewed_at TEXT,
  FOREIGN KEY (raw_item_id) REFERENCES raw_items(id)
);

CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);

-- Daily briefings
CREATE TABLE IF NOT EXISTS briefings (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  content_md TEXT NOT NULL,
  items_included TEXT NOT NULL,
  published INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed initial RSS sources
INSERT OR IGNORE INTO sources (id, name, type, config) VALUES
  ('anthropic-blog', 'Anthropic Blog', 'rss', '{"url":"https://www.anthropic.com/feed.xml"}'),
  ('openai-blog', 'OpenAI Blog', 'rss', '{"url":"https://openai.com/blog/rss.xml"}'),
  ('deepmind-blog', 'DeepMind Blog', 'rss', '{"url":"https://deepmind.google/blog/rss.xml"}'),
  ('meta-ai-blog', 'Meta AI Blog', 'rss', '{"url":"https://ai.meta.com/blog/rss/"}'),
  ('google-ai-blog', 'Google AI Blog', 'rss', '{"url":"https://blog.google/technology/ai/rss/"}'),
  ('microsoft-research', 'Microsoft Research', 'rss', '{"url":"https://www.microsoft.com/en-us/research/feed/"}'),
  ('simon-willison', 'Simon Willison', 'rss', '{"url":"https://simonwillison.net/atom/everything/"}'),
  ('lilian-weng', 'Lilian Weng', 'rss', '{"url":"https://lilianweng.github.io/index.xml"}'),
  ('karpathy', 'Andrej Karpathy', 'rss', '{"url":"https://karpathy.bearblog.dev/feed/"}'),
  ('chip-huyen', 'Chip Huyen', 'rss', '{"url":"https://huyenchip.com/feed.xml"}'),
  ('eugene-yan', 'Eugene Yan', 'rss', '{"url":"https://eugeneyan.com/rss/"}'),
  ('huggingface-blog', 'Hugging Face Blog', 'rss', '{"url":"https://huggingface.co/blog/feed.xml"}'),
  ('alignment-forum', 'Alignment Forum', 'rss', '{"url":"https://www.alignmentforum.org/feed.xml"}'),
  ('marginal-revolution', 'Marginal Revolution', 'rss', '{"url":"https://marginalrevolution.com/feed"}'),
  ('stratechery', 'Stratechery', 'rss', '{"url":"https://stratechery.com/feed/"}');
