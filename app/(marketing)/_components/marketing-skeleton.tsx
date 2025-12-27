'use client'

export function MarketingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 animate-bounce dark:hidden">
            <img
              src="/assets/svg/logo-dark.svg"
              alt="Narraverse"
              className="w-full h-full"
            />
          </div>
          <div className="w-16 h-16 animate-bounce hidden dark:block">
            <img
              src="/assets/svg/logo-light.svg"
              alt="Narraverse"
              className="w-full h-full"
            />
          </div>
        </div>
        <span className="text-muted-foreground animate-pulse">加载中...</span>
      </div>
    </div>
  )
}
