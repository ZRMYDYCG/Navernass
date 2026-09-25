import { useQuery } from "@tanstack/react-query";

import { listNovels } from "@/lib/api/novel.api";

export const novelKeys = {
  list: ["novels", "list"] as const,
};

export function useNovels({ enabled }: { enabled: boolean }) {
  return useQuery({ queryKey: novelKeys.list, queryFn: listNovels, enabled });
}
