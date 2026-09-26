import { z } from "zod";

export const sessionMessagePageSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      remote_id: z.string().nullable(),
      role: z.enum(["user", "assistant"]),
      parts: z.array(z.unknown()),
      metadata: z
        .object({
          runId: z.string().optional(),
          sessionId: z.string().optional(),
        })
        .passthrough()
        .optional(),
    }),
  ),
  nextCursor: z.string().nullable(),
});
