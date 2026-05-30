'use client'

export function TypingIndicator() {
  return (
    <div className="py-1.5 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
      <div className="flex items-center gap-2 pl-0.5">
        <span className="inline-block w-[2px] h-[14px] bg-primary animate-cursor-blink" aria-hidden />
      </div>
    </div>
  )
}
