import { z } from "zod";

export const authSessionSchema = z
  .object({
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.email(),
    }),
  })
  .nullable();

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  rememberMe: z.boolean().default(true),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(8).max(128),
});

export type SignInInput = z.input<typeof signInSchema>;
export type SignUpInput = z.input<typeof signUpSchema>;
