import { cookies } from "next/headers";

export async function hasSession() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
  try {
    const response = await fetch(`${backendUrl}/api/auth/get-session`, {
      cache: "no-store",
      headers: { cookie: (await cookies()).toString() },
    });
    if (!response.ok) return false;
    const session = (await response.json().catch(() => null)) as { user?: { id?: string } } | null;
    return Boolean(session?.user?.id);
  } catch {
    // 后端未启动或网络不可达时按未登录处理，避免 SSR 直接 500。
    return false;
  }
}
