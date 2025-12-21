'use client'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background">
      {children}
    </main>
  )
}
