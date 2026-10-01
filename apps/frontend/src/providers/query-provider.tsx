"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { broadcastQueryClient } from "@tanstack/query-broadcast-client-experimental";
import { useEffect, useState, type PropsWithChildren } from "react";

/**
 * 提供服务端状态缓存，并负责窗口焦点刷新与同源标签页同步。
 */
export function QueryProvider({ children }: PropsWithChildren) {
  // 在 Provider 的整个生命周期内复用同一实例，避免组件重渲染时丢失查询缓存。
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            // 标签页重新可见或获得焦点时，刷新当前仍被页面使用的查询。
            refetchOnWindowFocus: "always",
          },
        },
      }),
  );

  useEffect(
    // 在同源标签页之间同步缓存，避免多个工作区窗口长期显示不同的数据。
    () =>
      broadcastQueryClient({
        queryClient,
        broadcastChannel: "narraverse-query",
      }),
    [queryClient],
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      ) : null}
    </QueryClientProvider>
  );
}
