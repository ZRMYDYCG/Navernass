import Image from 'next/image'

const FEATURES = [
  {
    icon: '✨',
    title: '续写故事',
    description: '根据上下文智能续写',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: '✍️',
    title: '优化润色',
    description: '让文字表达更精彩',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: '💡',
    title: '创作建议',
    description: '提供专业的写作指导',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-600 dark:text-green-400',
  },
]

export function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <div className="mb-6 relative">
        <div className="w-20 h-20 rounded-full dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
          <Image
            src="/assets/svg/logo-dark.svg"
            width={50}
            height={50}
            alt="Logo"
            className="dark:hidden"
          />
          <Image
            src="/assets/svg/logo-light.svg"
            width={50}
            height={50}
            alt="Logo"
            className="hidden dark:block"
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        AI 写作助手
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        我可以帮你续写剧情、优化文字、润色对话，让创作更轻松
      </p>

      <div className="w-full max-w-sm space-y-2 mb-6">
        {FEATURES.map(feature => (
          <div
            key={feature.title}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-left border border-gray-100 dark:border-gray-700/50"
          >
            <div className="flex items-start gap-2">
              <div
                className={`w-5 h-5 rounded ${feature.bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}
              >
                <span className={`text-xs ${feature.textColor}`}>{feature.icon}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {feature.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {feature.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 flex flex-wrap items-center justify-center gap-x-1 gap-y-1.5">
        <span>在下方输入框开始对话，或使用快捷键</span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">
          Ctrl+Shift+A
        </kbd>
      </p>
    </div>
  )
}
