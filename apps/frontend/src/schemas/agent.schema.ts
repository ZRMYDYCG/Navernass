import { z } from "zod";

export const askUserInputSchema = z.object({
  title: z.string().optional(),
  questions: z
    .array(
      z.object({
        id: z.string(),
        prompt: z.string(),
        options: z.array(z.object({ id: z.string(), label: z.string() })),
        allowMultiple: z.boolean().default(false),
      }),
    )
    .min(1),
});

export const askUserOutputSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("answered"),
    answers: z.array(
      z.object({
        questionId: z.string(),
        selected: z.array(z.string()),
        other: z.string().optional(),
      }),
    ),
  }),
  z.object({
    status: z.literal("skipped"),
    reason: z.enum(["user_skipped", "user_sent_message"]),
  }),
]);

export type AskUserInput = z.infer<typeof askUserInputSchema>;
export type AskUserOutput = z.infer<typeof askUserOutputSchema>;

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
          toolTimings: z
            .record(
              z.string(),
              z.object({ startedAt: z.number(), durationMs: z.number().nonnegative().optional() }),
            )
            .optional(),
        })
        .passthrough()
        .optional(),
    }),
  ),
  nextCursor: z.string().nullable(),
});
