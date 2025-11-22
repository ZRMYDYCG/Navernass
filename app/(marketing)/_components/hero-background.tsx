export default function HeroBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 via-blue-500/10 to-transparent dark:from-purple-400/15 dark:via-blue-400/8 dark:to-transparent rounded-full blur-3xl" />
        <svg
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full"
          viewBox="0 0 800 400"
          fill="none"
        >
          <path
            d="M 0 200 Q 200 0, 400 200 T 800 200"
            stroke="url(#topArc)"
            strokeWidth="1.5"
            fill="none"
            className="opacity-60 dark:opacity-40"
          />
          <defs>
            <linearGradient id="topArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-full">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 to-transparent dark:from-purple-400/10 dark:to-transparent rounded-full blur-3xl" />
        <svg
          className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-full"
          viewBox="0 0 300 1200"
          fill="none"
        >
          <path
            d="M 150 0 Q 0 300, 150 600 T 150 1200"
            stroke="rgb(139, 92, 246)"
            strokeWidth="1.5"
            fill="none"
            className="opacity-40 dark:opacity-25"
          />
        </svg>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-full">
        <div className="absolute inset-0 bg-gradient-to-l from-cyan-500/15 to-transparent dark:from-cyan-400/10 dark:to-transparent rounded-full blur-3xl" />
        <svg
          className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-full"
          viewBox="0 0 300 1200"
          fill="none"
        >
          <path
            d="M 150 0 Q 300 300, 150 600 T 150 1200"
            stroke="rgb(6, 182, 212)"
            strokeWidth="1.5"
            fill="none"
            className="opacity-40 dark:opacity-25"
          />
        </svg>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-cyan-500/10 to-transparent dark:from-blue-400/15 dark:via-cyan-400/8 dark:to-transparent rounded-full blur-3xl" />
        <svg
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full"
          viewBox="0 0 800 400"
          fill="none"
        >
          <path
            d="M 0 200 Q 200 400, 400 200 T 800 200"
            stroke="url(#bottomArc)"
            strokeWidth="1.5"
            fill="none"
            className="opacity-60 dark:opacity-40"
          />
          <defs>
            <linearGradient id="bottomArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="rgb(6, 182, 212)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
