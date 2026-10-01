import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProvider,
  deleteProvider,
  getProviders,
  testProvider,
  updateProvider,
} from "@/lib/http/modules/provider.api";
import type { ProviderPayload } from "@/lib/http/modules/provider.schema";

export const providerKeys = {
  all: ["agent", "providers"] as const,
};

export function useProviders() {
  return useQuery({ queryKey: providerKeys.all, queryFn: getProviders });
}

export function useCreateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProvider,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: providerKeys.all }),
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProviderPayload }) =>
      updateProvider(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: providerKeys.all }),
  });
}

export function useDeleteProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProvider,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: providerKeys.all }),
  });
}

export function useTestProvider() {
  return useMutation({ mutationFn: testProvider });
}
