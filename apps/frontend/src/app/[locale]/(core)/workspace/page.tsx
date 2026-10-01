import { Workspace } from "./_components/workspace";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface WorkspacePageProps {
  params: Promise<{ locale: string }>;
}

async function hasSession() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
  const response = await fetch(`${backendUrl}/api/auth/get-session`, {
    cache: "no-store",
    headers: { cookie: (await cookies()).toString() },
  });
  if (!response.ok) return false;
  const session = (await response.json().catch(() => null)) as { user?: { id?: string } } | null;
  return Boolean(session?.user?.id);
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { locale } = await params;
  if (!(await hasSession())) {
    redirect(`/${locale}`);
  }

  return <Workspace />;
}
