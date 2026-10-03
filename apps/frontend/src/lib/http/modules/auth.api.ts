import { z } from "zod";

import { authBaseUrl } from "@/lib/http/client";
import { apiErrorSchema } from "@/lib/http/modules/api.schema";
import { authSessionSchema } from "@/lib/http/modules/auth.schema";

const authResponseSchema = z.unknown();

async function authRequest(path: string, init?: RequestInit) {
  const response = await fetch(`${authBaseUrl}/${path}`, {
    credentials: "include",
    headers: { "content-type": "application/json", ...init?.headers },
    ...init,
  });

  if (!response.ok) {
    const payload = apiErrorSchema.safeParse(
      await response
        .clone()
        .json()
        .catch(() => null),
    );
    throw new Error(payload.success ? payload.data.message : "请求失败，请稍后再试");
  }

  if (response.status === 204) return null;
  return authResponseSchema.parse(await response.json().catch(() => null));
}

export function signInEmail(input: { email: string; password: string }) {
  return authRequest("sign-in/email", { method: "post", body: JSON.stringify(input) });
}

export function signUpEmail(input: { name: string; email: string; password: string }) {
  return authRequest("sign-up/email", { method: "post", body: JSON.stringify(input) });
}

export function updateUser(input: { name?: string; image?: string | null }) {
  return authRequest("update-user", { method: "post", body: JSON.stringify(input) });
}

export function signOut() {
  return authRequest("sign-out", { method: "post" });
}

export async function getSession() {
  try {
    const response = await fetch(`${authBaseUrl}/get-session`, { credentials: "include" });
    if (!response.ok) return null;
    return authSessionSchema.parse(await response.json().catch(() => null));
  } catch {
    return null;
  }
}
