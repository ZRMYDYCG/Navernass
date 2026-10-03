import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createHook,
  deleteHook,
  getHookDispatches,
  getHookHandlers,
  getHooks,
  updateHook,
} from "@/lib/http/modules/hook.api";
import type { CreateHookPayload } from "@/lib/http/modules/hook.schema";

export const hookKeys = {
  all: ["hooks"] as const,
  handlers: ["hooks", "handlers"] as const,
  dispatches: ["hooks", "dispatches"] as const,
};

export function useHooks() {
  return useQuery({ queryKey: hookKeys.all, queryFn: getHooks });
}

export function useHookHandlers() {
  return useQuery({ queryKey: hookKeys.handlers, queryFn: getHookHandlers });
}

export function useHookDispatches() {
  return useQuery({ queryKey: hookKeys.dispatches, queryFn: getHookDispatches });
}

export function useCreateHook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hookKeys.all }),
  });
}

export function useUpdateHook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateHookPayload> }) =>
      updateHook(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hookKeys.all }),
  });
}

export function useDeleteHook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hookKeys.all }),
  });
}
