import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSession, signIn, signOut, signUp } from "@/lib/api/auth.api";

export const authKeys = {
  all: ["auth"] as const,
  session: ["auth", "session"] as const,
};

export function useSession() {
  return useQuery({ queryKey: authKeys.session, queryFn: getSession });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signIn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.session }),
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signUp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.session }),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, null);
      // 必须先写入会话再清理，否则会话 observer 会挂在已被移除的 query 上。
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== authKeys.all[0] });
    },
  });
}
