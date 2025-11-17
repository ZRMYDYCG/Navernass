export default function WritingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-zinc-900">{children}</div>
  );
}
