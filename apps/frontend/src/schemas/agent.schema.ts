import { z } from "zod";

const askOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

const askQuestionSchema = z.object({
  id: z.string(),
  header: z.string(),
  question: z.string(),
  type: z.enum(["text", "singleChoice", "multiChoice", "confirm"]),
  options: z.array(askOptionSchema),
  required: z.boolean(),
  allowCustom: z.boolean(),
  placeholder: z.string().optional(),
});

export const pendingQuestionSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  runId: z.string(),
  status: z.string(),
  title: z.string(),
  reason: z.string().optional(),
  questions: z.array(askQuestionSchema),
});

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

export const dismissQuestionSchema = z.object({ dismissed: z.boolean() });

export type AskQuestion = z.infer<typeof askQuestionSchema>;
export type PendingQuestion = z.infer<typeof pendingQuestionSchema>;
