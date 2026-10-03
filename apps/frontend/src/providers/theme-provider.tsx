"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * 与全局样式中声明的主题名称保持一致。
 */
export const themes = ["light", "dark", "dusk"] as const;

/**
 * 通过根节点 class 切换主题，并默认跟随操作系统偏好。
 * 客户端将注入脚本标为 data block，避免 React 19 对可执行 script 的告警。
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={[...themes]}
      disableTransitionOnChange
      {...props}
      scriptProps={typeof window === "undefined" ? undefined : { type: "application/json" }}
    >
      {children}
    </NextThemesProvider>
  );
}
