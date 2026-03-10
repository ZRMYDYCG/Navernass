'use client'

export function OfflineActions() {
  return (
    <button 
      onClick={() => window.location.reload()}
      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      重试连接
    </button>
  )
}
