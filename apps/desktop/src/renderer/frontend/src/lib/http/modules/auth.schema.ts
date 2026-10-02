import { z } from "zod";

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export const authSessionSchema = z
  .object({
    user: authUserSchema,
  })
  .passthrough()
  .nullable();

export type AuthSession = z.infer<typeof authSessionSchema>;
