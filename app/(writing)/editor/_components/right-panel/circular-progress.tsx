interface CircularProgressProps {
  messageCount: number
  maxMessages?: number
}

export function CircularProgress({ messageCount, maxMessages = 50 }: CircularProgressProps) {
  const normalizedCount = Math.min(messageCount, maxMessages)
  const progress = (normalizedCount / maxMessages) * 100
  const radius = 5
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-3.5 h-3.5 flex-shrink-0 text-stone-300 dark:text-zinc-600">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 12 12" aria-hidden="true">
        <circle
          cx="6"
          cy="6"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          className="opacity-50"
        />
        <circle
          cx="6"
          cy="6"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-stone-500 dark:text-zinc-400 transition-all duration-300"
        />
      </svg>
    </div>
  )
}
