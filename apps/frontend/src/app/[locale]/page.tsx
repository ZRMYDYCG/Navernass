import { redirect } from "@/i18n/navigation";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  redirect({ href: "/workspace", locale });
}
