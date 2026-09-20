'use client'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {children}
    </div>
  )
}
