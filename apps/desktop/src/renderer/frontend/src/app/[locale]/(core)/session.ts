import { cookies } from "next/headers";

export async function hasSession() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
  const response = await fetch(`${backendUrl}/api/auth/get-session`, {
    cache: "no-store",
    headers: { cookie: (await cookies()).toString() },
  });
  if (!response.ok) return false;
  const session = (await response.json().catch(() => null)) as { user?: { id?: string } } | null;
  return Boolean(session?.user?.id);
}
