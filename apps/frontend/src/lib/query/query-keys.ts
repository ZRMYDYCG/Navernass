export const queryKeys = {
  starter: {
    all: ["starter"] as const,
    status: () => [...queryKeys.starter.all, "status"] as const,
  },
} as const;
