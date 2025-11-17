'use client'

interface PromptButtonsProps {
  onPromptClick?: (prompt: string) => void
  disabled?: boolean
}

export function PromptButtons({ onPromptClick, disabled = false }: PromptButtonsProps) {
  const prompts = [
    { label: '帮我构思一个悬疑推理小说的开篇情节' },
    { label: '如何塑造一个令人印象深刻的反派角色？' },
    { label: '生成都市言情小说的人物关系网' },
    { label: '写一段充满张力的对话场景' },
    { label: '帮我设计一个独特的魔法体系' },
    { label: '优化这段文字的节奏感和情绪渲染' },
  ]

  const handleClick = (prompt: string) => {
    if (onPromptClick && !disabled) {
      onPromptClick(prompt)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4">
      <div className="flex flex-wrap gap-3 justify-center">
        {prompts.map(prompt => (
          <button
            key={prompt.label}
            type="button"
            onClick={() => handleClick(prompt.label)}
            disabled={disabled}
            className={`px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800/50 text-gray-800 dark:text-gray-200 transition-all duration-200 text-sm font-medium hover:shadow-md hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 ${
              disabled
                ? 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100 hover:shadow-none'
                : 'cursor-pointer'
            }`}
          >
            {prompt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
