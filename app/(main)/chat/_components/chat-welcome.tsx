'use client'

interface ChatWelcomeProps {
  isLoading?: boolean
}

export function ChatWelcome({ isLoading = false }: ChatWelcomeProps) {
  return (
    <div className="text-center mb-3 space-y-6">      
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          晚上好，一勺
        </h1>
        
        <p className="text-lg text-gray-500 dark:text-gray-400">
          {isLoading ? '正在创建对话...' : '开始创作你的故事吧'}
        </p>
      </div>
    </div>
  )
}
