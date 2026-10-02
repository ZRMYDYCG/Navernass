import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCustomSkill,
  deleteCustomSkill,
  getCustomSkills,
  getSkills,
  updateCustomSkill,
} from "@/lib/http/modules/skill.api";
import type {
  CreateCustomSkillPayload,
  UpdateCustomSkillPayload,
} from "@/lib/http/modules/skill.schema";

export const skillKeys = {
  all: ["skills"] as const,
  custom: ["skills", "custom"] as const,
};

export function useSkills() {
  return useQuery({ queryKey: skillKeys.all, queryFn: getSkills });
}

export function useCustomSkills() {
  return useQuery({ queryKey: skillKeys.custom, queryFn: getCustomSkills });
}

export function useCreateCustomSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomSkillPayload) => createCustomSkill(payload),
    onSuccess: () => invalidateSkills(queryClient),
  });
}

export function useUpdateCustomSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomSkillPayload }) =>
      updateCustomSkill(id, payload),
    onSuccess: () => invalidateSkills(queryClient),
  });
}

export function useDeleteCustomSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomSkill,
    onSuccess: () => invalidateSkills(queryClient),
  });
}

function invalidateSkills(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: skillKeys.all });
  void queryClient.invalidateQueries({ queryKey: skillKeys.custom });
}
