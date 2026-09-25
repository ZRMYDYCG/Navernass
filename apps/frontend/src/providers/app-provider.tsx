"use client";

import type { PropsWithChildren } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import { ScanProvider } from "@/providers/scan-provider";
import { ThemeProvider } from "@/providers/theme-provider";

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
