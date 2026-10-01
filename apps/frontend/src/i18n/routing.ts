import { defineRouting } from "next-intl/routing";

/**
 * 全站国际化路由配置，供 proxy、导航 API 与请求级配置共同复用。
 */
export const routing = defineRouting({
  // 支持的语言列表
  locales: ["zh-CN", "en-US"],
  // 默认语言；语言协商无法命中时回退到该语言
  defaultLocale: "zh-CN",
  // URL 始终携带语言前缀，如 /zh-CN/workspace、/en-US/workspace
  localePrefix: "always",
});

/** 
 * 站点支持的语言。 
 */
export type AppLocale = (typeof routing.locales)[number];
