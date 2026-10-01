import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";

import { routing } from "./routing";

/**
 * next-intl 的请求级配置（由 next.config 中的插件按 src/i18n/request.ts 约定加载），
 * 每次请求根据语言加载对应的 messages JSON。
 */
export default getRequestConfig(async ({ locale }) => {
  // 部分渲染入口不会携带 locale（如语言段之外的调用），
  // 此时从根级路由参数中读取；非法语言直接 404 兜底。
  if (!locale) {
    const paramValue = await rootParams.locale();
    if (hasLocale(routing.locales, paramValue)) {
      locale = paramValue;
    } else {
      notFound();
    }
  }

  return {
    locale,
    // 动态加载 messages/<locale>.json
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
