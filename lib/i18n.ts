const translations = {
  en: {
    library: "Library",
    search: "Search",
    dashboard: "Dashboard",
    roadmap: "Roadmap",
    libraryTitle: "Library",
    libraryTitleZh: "/ 知识库",
    explore: "Explore",
    viewLatest: "View latest",
    heroTitle: "What will we\nlearn today",
    heroSubtitle: "A personal AI learning library",
    heroSubtitleZh: "一个个人 AI 学习知识库",
    backToLibrary: "← Back to Library",
    coreInsight: "Core Insight",
    myAnalysis: "My Analysis",
    relatedArticles: "Related",
    newest: "Newest",
    sourceLink: "View source",
    readingTime: "min read",
    footer: "ariawiki.com — personal AI learning library",
    langToggle: "中文",
  },
  zh: {
    library: "知识库",
    search: "搜索",
    dashboard: "仪表盘",
    roadmap: "路线图",
    libraryTitle: "知识库",
    libraryTitleZh: "/ Library",
    explore: "探索",
    viewLatest: "最新文章",
    heroTitle: "今天我们\n学什么",
    heroSubtitle: "一个个人 AI 学习知识库",
    heroSubtitleZh: "A personal AI learning library",
    backToLibrary: "← 返回知识库",
    coreInsight: "核心洞察",
    myAnalysis: "我的分析",
    relatedArticles: "相关文章",
    newest: "最新",
    sourceLink: "查看原文",
    readingTime: "分钟阅读",
    footer: "ariawiki.com — 个人 AI 学习知识库",
    langToggle: "EN",
  },
} as const;

export type Lang = "en" | "zh";
export type TranslationKey = keyof (typeof translations)["en"];

export function t(lang: Lang, key: TranslationKey): string {
  return translations[lang][key];
}
