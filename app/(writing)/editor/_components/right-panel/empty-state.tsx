// import type { LucideIcon } from 'lucide-react'
// import { Lightbulb, PenTool, Wand2 } from 'lucide-react'
import Image from 'next/image'

// const FEATURES: Array<{
//   icon: LucideIcon
//   title: string
//   description: string
//   iconColor: string
// }> = [
//   {
//     icon: Wand2,
//     title: '续写故事',
//     description: '根据上下文智能续写',
//     iconColor: 'text-purple-500',
//   },
//   {
//     icon: PenTool,
//     title: '优化润色',
//     description: '让文字表达更精彩',
//     iconColor: 'text-blue-500',
//   },
//   {
//     icon: Lightbulb,
//     title: '创作建议',
//     description: '提供专业的写作指导',
//     iconColor: 'text-amber-500',
//   },
// ]

export function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <div className="mb-6 relative">
        <div className="w-20 h-20 rounded-full flex items-center justify-center">
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

      <h3 className="text-lg font-medium text-foreground mb-2 tracking-tight">
        AI 写作助手
      </h3>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs leading-relaxed">
        我可以帮你续写剧情、优化文字、润色对话，让创作更轻松
      </p>

      {/* <div className="w-full max-w-sm space-y-2.5 mb-8">
        {FEATURES.map(feature => (
          <div
            key={feature.title}
            className="bg-stone-50/50 dark:bg-zinc-800/30 rounded-xl p-3 text-left border border-stone-100 dark:border-zinc-800 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-800/50 hover:border-stone-200 dark:hover:border-zinc-700"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm border border-stone-100 dark:border-zinc-700">
                <feature.icon className={`w-4 h-4 ${feature.iconColor}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-[#333333] dark:text-zinc-100 mb-0.5">
                  {feature.title}
                </div>
                <div className="text-xs text-stone-500 dark:text-zinc-400">
                  {feature.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* <p className="text-xs text-stone-400 dark:text-zinc-500 flex flex-wrap items-center justify-center gap-x-1 gap-y-1.5">
        <span>在下方输入框开始对话，或使用快捷键</span>
        <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded text-[10px] font-sans shadow-sm">
          Ctrl+Shift+A
        </kbd>
      </p> */}
    </div>
  )
}
