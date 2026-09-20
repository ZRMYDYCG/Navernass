import { z } from "zod";

export const apiErrorSchema = z.object({
  code: z.string().optional(),
  message: z.string(),
  details: z.unknown().optional(),
});

export type ApiErrorPayload = z.infer<typeof apiErrorSchema>;
