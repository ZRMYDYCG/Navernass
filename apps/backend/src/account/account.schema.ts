import { z } from "zod";

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullable()
    .optional();

export const updateProfile = z.object({
  username: nullableText(64),
  full_name: nullableText(191),
  avatar_url: nullableText(2_000),
  website: z
    .url()
    .or(z.literal(""))
    .transform((value) => value || null)
    .nullable()
    .optional(),
});

export type UpdateProfile = z.infer<typeof updateProfile>;
