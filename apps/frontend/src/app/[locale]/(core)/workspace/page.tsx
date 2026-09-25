import { Workspace } from "./_components/workspace";

interface WorkspacePageProps {
  searchParams: Promise<{
    novelId?: string | string[];
    chapterId?: string | string[];
    sessionId?: string | string[];
  }>;
}

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const query = await searchParams;
  return (
    <Workspace
      novelId={single(query.novelId)}
      chapterId={single(query.chapterId)}
      sessionId={single(query.sessionId)}
    />
  );
}
