import { z } from "zod";

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
const apiBaseUrl = `${backendUrl}/api/v1`;
const authBaseUrl = `${backendUrl}/api/auth`;

const apiEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
});

const userSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
});

export const sessionSchema = z
  .object({
    user: userSchema.nullish(),
  })
  .nullable();

export const novelSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  word_count: z.number().optional(),
  updated_at: z.string().optional(),
});

export const chatSessionSchema = z.object({
  id: z.string(),
  title: z.string().nullish(),
  updated_at: z.string().optional(),
});

export const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system", "tool"]),
  parts: z.unknown(),
});

export type Session = z.infer<typeof sessionSchema>;
export type Novel = z.infer<typeof novelSchema>;
export type ChatSession = z.infer<typeof chatSessionSchema>;
export type AgentMessage = z.infer<typeof messageSchema>;

async function authRequest(path: string, init?: RequestInit) {
  const response = await fetch(`${authBaseUrl}/${path}`, {
    credentials: "include",
    headers: { "content-type": "application/json", ...init?.headers },
    ...init,
  });
  if (!response.ok) throw new Error(await response.text().catch(() => "请求失败"));
  return response.json().catch(() => null) as Promise<unknown>;
}

async function apiRequest<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  init?: RequestInit,
): Promise<z.output<TSchema>> {
  const response = await fetch(`${apiBaseUrl}/${path}`, {
    credentials: "include",
    headers: { "content-type": "application/json", ...init?.headers },
    ...init,
  });
  if (!response.ok) throw new Error(await response.text().catch(() => "请求失败"));
  const text = await response.text();
  if (!text) return schema.parse(null);
  return schema.parse(apiEnvelopeSchema.parse(JSON.parse(text)).data);
}

export function getSession() {
  return fetch(`${authBaseUrl}/get-session`, { credentials: "include" })
    .then((response) => (response.ok ? response.json() : null))
    .then((payload) => sessionSchema.parse(payload));
}

export function signInEmail(input: { email: string; password: string }) {
  return authRequest("sign-in/email", { method: "post", body: JSON.stringify(input) });
}

export function signUpEmail(input: { name: string; email: string; password: string }) {
  return authRequest("sign-up/email", { method: "post", body: JSON.stringify(input) });
}

export function signOut() {
  return authRequest("sign-out", { method: "post" });
}

export function getNovels() {
  return apiRequest("novels?page=1&pageSize=100", z.array(novelSchema));
}

export function createNovel(title: string) {
  return apiRequest("novels", novelSchema, {
    method: "post",
    body: JSON.stringify({ title, description: "" }),
  });
}

export function getChatSessions(novelId: string) {
  return apiRequest(
    `agent/sessions?novelId=${encodeURIComponent(novelId)}&page=1&pageSize=100`,
    z.array(chatSessionSchema),
  );
}

export function getSessionMessages(sessionId: string) {
  return apiRequest(
    `agent/sessions/${sessionId}/messages?limit=100`,
    z.object({ items: z.array(messageSchema) }),
  ).then((page) => page.items);
}

export async function startAgentPrompt(input: {
  novelId: string;
  sessionId?: string;
  prompt: string;
}) {
  const response = await fetch(`${apiBaseUrl}/agent/runs/stream`, {
    method: "post",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      requestId: crypto.randomUUID(),
      novelId: input.novelId,
      sessionId: input.sessionId,
      prompt: input.prompt,
      context: {},
    }),
  });
  if (!response.ok) throw new Error(await response.text().catch(() => "Agent 请求失败"));
  return response.text();
}
