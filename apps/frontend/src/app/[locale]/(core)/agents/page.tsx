import { Agents } from "./_components/agents";
import { redirect } from "next/navigation";

import { hasSession } from "../session";

interface AgentsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AgentsPage({ params }: AgentsPageProps) {
  const { locale } = await params;
  if (!(await hasSession())) {
    redirect(`/${locale}`);
  }

  return <Agents />;
}
