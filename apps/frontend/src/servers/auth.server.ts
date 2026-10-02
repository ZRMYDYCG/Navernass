import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSession, updateUser } from "@/lib/http/modules/auth.api";

export const authKeys = {
  session: ["auth", "session"] as const,
};

export function useSession() {
  return useQuery({ queryKey: authKeys.session, queryFn: getSession });
}

/** 更新当前用户的昵称或头像；better-auth 会同步刷新会话 cookie，重新拉取即可拿到新资料。 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.session }),
  });
}
