import { z } from "zod";

const errorBodySchema = z.object({
  code: z.string().optional(),
  message: z.string(),
  details: z.unknown().optional(),
});

export const apiErrorSchema = z.union([
  z.object({ error: errorBodySchema }).transform(({ error }) => error),
  errorBodySchema,
]);

export type ApiErrorPayload = z.output<typeof apiErrorSchema>;

export const apiEnvelopeSchema = z.object({ success: z.literal(true), data: z.unknown() });
