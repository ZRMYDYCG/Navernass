import { authClient } from "@/lib/http/client";
import {
  authSessionSchema,
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
} from "@/schemas/auth.schema";

export async function getSession() {
  return authSessionSchema.parse(await authClient.get("get-session").json());
}

export async function signIn(input: SignInInput) {
  await authClient.post("sign-in/email", { json: signInSchema.parse(input) });
}

export async function signUp(input: SignUpInput) {
  await authClient.post("sign-up/email", { json: signUpSchema.parse(input) });
}

export async function signOut() {
  await authClient.post("sign-out", { json: {} });
}
