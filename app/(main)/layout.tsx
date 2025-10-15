import MainLayout from "@/layout/MainLayout";

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
