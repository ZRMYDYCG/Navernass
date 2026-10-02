import type { Metadata } from "next";

export const siteConfig = {
  name: "Narraverse",
  metadata: {
    title: "Narraverse - AI 小说创作平台",
    description:
      "Narraverse 是面向网文创作者的 AI 小说创作平台，支持灵感共创、人物设定管理、章节续写与发布。",
    icons: { icon: "/logo.png" },
  },
} satisfies { name: string; metadata: Metadata };
