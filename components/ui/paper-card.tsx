import * as React from "react"
import { cn } from "@/lib/utils"

interface PaperCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "stack" | "floating"
}

const PaperCard = React.forwardRef<HTMLDivElement, PaperCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative bg-[#FDFBF7] dark:bg-zinc-800 rounded-xl border border-stone-200/60 dark:border-zinc-700/50",
          "shadow-sm transition-all duration-300",
          "overflow-hidden",
          // Paper texture overlay
          "before:absolute before:inset-0 before:bg-paper-texture before:opacity-40 before:pointer-events-none before:z-0",
          {
            "hover:shadow-md hover:-translate-y-1": variant === "default",
            "shadow-md rotate-1 after:absolute after:inset-0 after:bg-[#FDFBF7] after:dark:bg-zinc-800 after:rounded-xl after:border after:border-stone-200/60 after:dark:border-zinc-700/50 after:-z-10 after:-rotate-2 after:shadow-sm": variant === "stack",
            "shadow-lg hover:shadow-xl hover:-translate-y-1": variant === "floating",
          },
          className
        )}
        {...props}
      >
        <div className="relative z-10 h-full">{props.children}</div>
      </div>
    )
  }
)
PaperCard.displayName = "PaperCard"

export { PaperCard }

