import { queryOptions } from "@tanstack/react-query";

import { queryKeys } from "./query-keys";

async function getStarterStatus() {
  // 本地示例不会产生网络请求，替换为 apiRequest 即可连接真实接口
  await new Promise((resolve) => setTimeout(resolve, 250));
  return { ready: true, checkedAt: new Date().toISOString() };
}

export const starterStatusOptions = () =>
  queryOptions({
    queryKey: queryKeys.starter.status(),
    queryFn: getStarterStatus,
  });
