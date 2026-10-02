import { Workspace } from "./_components/workspace";
import { redirect } from "next/navigation";

import { hasSession } from "../session";

interface WorkspacePageProps {
  params: Promise<{ locale: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { locale } = await params;
  if (!(await hasSession())) {
    redirect(`/${locale}`);
  }

  return <Workspace />;
}
