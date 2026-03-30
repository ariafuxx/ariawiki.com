# ariawiki.com — Project Spec for Development

## Overview
Personal AI learning library website. Clean, content-first knowledge base for tracking and sharing learning about AI research, tech blogs, product analysis, and quick insights.

**Domain:** ariawiki.com
**Deployment:** Cloudflare Pages
**Framework:** Next.js 14 (App Router)
**Styling:** Tailwind CSS
**Content:** Markdown files with frontmatter (Phase 1), CMS later
**Language:** Bilingual (EN/中文), toggle in top-right nav

---

## Design Direction

**Tone:** Minimal, tool-like, content-first. Warm but restrained.

**Color Palette:**
- Background: warm off-white `#FAF9F6`
- Primary text: near-black `#1A1A1A`
- Secondary text: warm gray `#6A6A62` / `#9A9A92` / `#B0AA9E`
- Accent: warm golden yellow `#E8A820` — used sparingly for interactive elements, active states, highlights
- Cards: white `#FFF` with `1px solid #E8E6E0` border
- Card hover: `translateY(-5px)` + deeper shadow
- Filter pills active: `#E8A820` bg + `#1A1A1A` text
- Filter pills inactive: `#EFEDE6` bg + `#7A7A72` text

**Typography:**
- Display/headings: `Instrument Serif` (Google Fonts)
- Body/UI: `DM Sans` (Google Fonts)
- Mono/tags/metadata: `DM Mono` (Google Fonts)
- Chinese: `Noto Sans SC` (Google Fonts)

**Custom cursor:** Yellow circle (#E8A820), 18px default, 44px on hover over interactive elements. Uses direct DOM ref manipulation (not React state) for zero lag. `mix-blend-mode: multiply`.

---

## Pages & Features

### 1. Homepage (Hero + Library)
**Route:** `/`

**Hero Section (full viewport height):**
- Pac-Man runner animation as hero background (Canvas-based, see `ariawiki-v4.jsx` for complete implementation)
  - Pac-Man character (yellow, classic shape) auto-runs right, jumps over ghosts, eats dots
  - Ghosts as obstacles (4 colors: red, pink, blue, orange, classic shape with wavy bottom)
  - Pac-dots (small) and power pellets (large with glow) as collectibles
  - Pac-Man mouth opens when eating, then slowly closes
  - Speed: 0.8 (slow, relaxed pace)
  - Jump height: h * 0.14 (gentle arcs)
  - Fixed level pattern loops every 2000px
  - No collision death — purely decorative
- Faint background textures (very low opacity 0.05-0.09):
  - Transformer architecture diagram (SVG, right side)
  - Go board grid with stones (SVG, bottom right)
  - Attention code snippet (pre, bottom left)
  - Neural network nodes (SVG, top left)
- Hero text overlaid:
  - "What will we learn today?" in Instrument Serif, clamp(52px, 7vw, 88px), yellow "?"
  - "A personal AI learning library" subtitle
  - "一个个人 AI 学习知识库" Chinese subtitle
- "View latest" circle button (96px, dark bg, hover shows latest article cover)
- "Explore ↓" scroll indicator at bottom

**Library Section (below hero):**
- Section title: "Library / 知识库" with yellow underline accent
- Filter pills: All | Papers | Tech Blogs | Products | TIL | Curated Lists
- Sort dropdown: Newest (default)
- Card grid: `repeat(auto-fill, minmax(320px, 1fr))`
- Each card:
  - Cover image area (172px height, gradient placeholder + halftone dot overlay + label)
  - Collection tag (colored pill)
  - Title (15px, bold, 2-line clamp)
  - One-line takeaway (13px, gray, 1-line clamp)
  - Bottom row: difficulty badge, status emoji (📖/✅/🔁/💡), date, language tag (EN/中文)

**Navigation (fixed):**
- Left: "ariawiki.com" in DM Mono
- Right: Library | Search | Dashboard | Roadmap + language toggle (EN/中文)
- Transparent on hero, solid cream bg with blur on scroll

**Footer:**
- "ariawiki.com — personal AI learning library"
- Links: GitHub, X, Email

### 2. Article Detail Page
**Route:** `/library/[slug]`
- Back link to library
- Cover image (4:1 ratio)
- Metadata row: collection, difficulty, status, date, reading time, language
- Title (28-32px, Instrument Serif)
- Source link (external)
- Content (max-width 720px):
  - "Core insight" section with yellow left border
  - "My analysis" section (markdown)
  - "Related articles" section (small horizontal cards)

### 3. Search Page
**Route:** `/search`
- Large centered search input with yellow focus ring
- Placeholder: "What do you want to learn? / 你想学什么？"
- Popular searches as clickable pills before searching
- After search: AI recommendation card + list-style results
- Implementation: Cloudflare Vectorize for embeddings, Claude API for recommendation text

### 4. Dashboard
**Route:** `/dashboard`
- Overview cards (4): total reads, this week, streak, most active collection
- GitHub-style activity heatmap (3 months, yellow shades)
- Collection distribution bar chart
- Recent activity feed (last 10)

### 5. Roadmap
**Route:** `/roadmap`
- Vertical timeline with yellow line
- Phase 1 "Foundation" — In Progress (active, full opacity)
  - ✅ Content library with 5 collections
  - ✅ Card-based browsing with filters
  - ✅ Article detail pages with notes
  - ✅ Semantic search with AI recommendations
  - ✅ Learning dashboard with streak
  - ✅ Bilingual support
- Phase 2 "Interactive Learning" — Planned (slightly faded)
  - ☐ Highlight & annotate (Granola-style)
  - ☐ Auto-summarize highlights
  - ☐ Personal note-taking
  - ☐ AI chatbot on knowledge base
  - ☐ MCP / Agent API
- Phase 3 "Community" — Future (most faded)
  - ☐ Community contributions
  - ☐ Editorial review workflow
  - ☐ Comment system
  - ☐ Contributor profiles

---

## Content Structure

### Markdown file format
Each article is a `.md` file in `/content/library/`:

```yaml
---
title: "Constitutional AI: Harmlessness from AI Feedback"
title_zh: "Constitutional AI：通过AI反馈实现无害性"
collection: papers  # papers | tech-blogs | products | til | curated-lists
tags: [alignment, RLHF, Anthropic]
difficulty: advanced  # beginner | intermediate | advanced
status: completed  # reading | completed | revisit | insight
date: 2026-03-29
cover: /images/covers/anthropic-constitutional-ai.png
source: https://arxiv.org/abs/2212.08073
language: en  # en | zh
reading_time: 45
---

## Core Insight
One-sentence summary of the key takeaway.

## My Analysis
Longer form notes, thoughts, connections to other readings.

## Related
- [RLHF paper](/library/rlhf-paper)
- [Claude model card](/library/claude-model-card)
```

### Collections
| Collection | Slug | Description |
|---|---|---|
| Papers & Research | `papers` | Academic papers, technical reports |
| Tech Blogs | `tech-blogs` | Anthropic blog, a16z, industry research |
| Products | `products` | Product teardowns and analysis |
| TIL (Today I Learned) | `til` | Quick learnings, concepts, tricks |
| Curated Lists | `curated-lists` | Reading guides, "Top N" lists |

### Cover image rules
- Papers → paper title page screenshot or institution logo
- Tech Blogs → original blog OG image or header
- Products → product interface screenshot
- TIL → themed color block with keyword
- Curated Lists → representative collage
- All images go in `/public/images/covers/`
- Placeholder: dark gradient + halftone dot overlay + monospace label (already implemented in JSX)

---

## Technical Details

### Tech Stack
- **Next.js 14** with App Router
- **Tailwind CSS** for styling
- **MDX** or gray-matter + remark for markdown processing
- **Cloudflare Pages** for hosting
- **Cloudflare Vectorize** for semantic search (Phase 1.5)
- **Claude API** for search recommendation text

### Project Structure
```
ariawiki/
├── app/
│   ├── layout.tsx          # Root layout with fonts, nav, footer, cursor
│   ├── page.tsx            # Homepage (hero + library)
│   ├── library/
│   │   └── [slug]/
│   │       └── page.tsx    # Article detail
│   ├── search/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── roadmap/
│       └── page.tsx
├── components/
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── CustomCursor.tsx
│   ├── HeroRunner.tsx      # Pac-Man canvas animation
│   ├── LibraryGrid.tsx
│   ├── LibraryCard.tsx
│   ├── FilterPills.tsx
│   └── LanguageToggle.tsx
├── content/
│   └── library/            # Markdown files
│       ├── constitutional-ai.md
│       └── ...
├── public/
│   └── images/
│       └── covers/
├── lib/
│   ├── content.ts          # Read & parse markdown
│   └── types.ts
├── tailwind.config.ts
├── next.config.js
└── package.json
```

### Deployment
1. Buy domain ariawiki.com (Cloudflare Registrar or Namecheap)
2. Create GitHub repo
3. Connect to Cloudflare Pages
4. Build command: `next build`
5. Output directory: `.next`
6. Or use `@cloudflare/next-on-pages` for edge deployment

### Key Implementation Notes
- The Pac-Man hero animation is entirely in a Canvas element, runs at 60fps, no external dependencies
- Custom cursor uses `ref` + direct DOM manipulation, NOT React state (for zero lag)
- Hover detection uses `data-hover` attribute + event delegation
- Nav becomes opaque with backdrop-blur on scroll (scrollY > 60)
- All card animations use CSS transitions, not JS
- Language toggle switches UI labels AND article titles (title vs title_zh)
- Card grid uses `auto-fill` for responsive without breakpoints
- The hero section is `100vh` min-height with the Canvas as absolute-positioned background

---

## Reference File

The complete working prototype is in `ariawiki-v4.jsx` — this is a single-file React component that includes everything: nav, hero with Pac-Man animation, library grid, cards, footer, cursor, and all styling. Use it as the definitive reference for all visual details, colors, spacing, and animations when building the Next.js project.
