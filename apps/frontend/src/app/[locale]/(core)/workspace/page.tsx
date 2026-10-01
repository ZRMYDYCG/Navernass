import { Workspace } from "./_components/workspace";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface WorkspacePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    novelId?: string | string[];
    chapterId?: string | string[];
    sessionId?: string | string[];
  }>;
}

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
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

export default async function WorkspacePage({ params, searchParams }: WorkspacePageProps) {
  const { locale } = await params;
  const query = await searchParams;
  if (!(await hasSession())) {
    redirect(`/${locale}`);
  }

  return (
    <Workspace
      novelId={single(query.novelId)}
      chapterId={single(query.chapterId)}
      sessionId={single(query.sessionId)}
    />
  );
}
