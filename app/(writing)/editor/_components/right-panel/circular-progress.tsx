interface CircularProgressProps {
  messageCount: number
  maxMessages?: number
}

export function CircularProgress({ messageCount, maxMessages = 50 }: CircularProgressProps) {
  const normalizedCount = Math.min(messageCount, maxMessages)
  const progress = (normalizedCount / maxMessages) * 100
  const circumference = 2 * Math.PI * 5
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-3 h-3 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 12 12">
        <circle
          cx="6"
          cy="6"
          r="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-300 dark:text-gray-600"
        />
        <circle
          cx="6"
          cy="6"
          r="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-gray-600 dark:text-gray-400 transition-all duration-300"
        />
      </svg>
    </div>
  )
}
