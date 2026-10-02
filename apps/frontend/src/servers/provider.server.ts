import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProvider,
  getModelCatalog,
  discoverModels,
  deleteProvider,
  getProviders,
  testProvider,
  updateProvider,
} from "@/lib/http/modules/provider.api";
import type { ProviderKind, ProviderPayload } from "@/lib/http/modules/provider.schema";

/**
 * 模型供应商数据使用的稳定缓存键。
 */
export const providerKeys = {
  all: ["agent", "providers"] as const,
};

/**
 * 获取已配置的模型供应商列表。
 */
export function useProviders() {
  return useQuery({ queryKey: providerKeys.all, queryFn: getProviders });
}

/**
 * 创建模型供应商，并在成功后刷新列表。
 */
export function useCreateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProvider,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: providerKeys.all }),
  });
}

/**
 * 更新模型供应商，并在成功后刷新列表。
 */
export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProviderPayload }) =>
      updateProvider(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: providerKeys.all }),
  });
}

/**
 * 删除模型供应商，并在成功后刷新列表。
 */
export function useDeleteProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProvider,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: providerKeys.all }),
  });
}

/**
 * 测试模型供应商的连接配置。
 */
export function useTestProvider() {
  return useMutation({ mutationFn: testProvider });
}

export function useModelCatalog(kind: ProviderKind) {
  return useQuery({
    queryKey: ["agent", "model-catalog", kind],
    queryFn: () => getModelCatalog(kind),
    staleTime: 3_600_000,
    retry: false,
  });
}
export function useDiscoverModels() {
  return useMutation({ mutationFn: discoverModels });
}
