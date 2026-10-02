"use client";

import type { PropsWithChildren } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import { ScanProvider } from "@/providers/scan-provider";
import { ThemeProvider } from "@/providers/theme-provider";

/**
 * 集中装配全局上下文；越靠外的 Provider，覆盖范围越大。
 */
export function AppProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <ScanProvider />
      <QueryProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
