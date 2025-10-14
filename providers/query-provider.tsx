"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 数据保持新鲜的时间（1分钟内不会重新请求）
            staleTime: 60 * 1000,
            // 缓存时间（5分钟后清理未使用的缓存）
            gcTime: 5 * 60 * 1000,
            // 失败后重试次数
            retry: 1,
            // 窗口重新聚焦时自动刷新
            refetchOnWindowFocus: false,
          },
          mutations: {
            // mutation 失败后重试次数
            retry: 0,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
