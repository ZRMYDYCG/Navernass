import Image from 'next/image'

export function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute top-[15%] left-[10%] w-[60%] h-[0.5px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent rotate-[-15deg] animate-pulse [animation-duration:3s]" />
        <div className="absolute top-[35%] right-[5%] w-[55%] h-[0.5px] bg-gradient-to-r from-transparent via-sky-400/50 to-transparent rotate-[10deg] animate-pulse [animation-duration:4s] [animation-delay:0.5s]" />
        <div className="absolute top-[60%] left-[15%] w-[50%] h-[0.5px] bg-gradient-to-r from-transparent via-pink-400/40 to-transparent rotate-[-8deg] animate-pulse [animation-duration:3.5s] [animation-delay:1s]" />
        <div className="absolute top-[80%] right-[10%] w-[45%] h-[0.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rotate-[6deg] animate-pulse [animation-duration:4.5s] [animation-delay:1.5s]" />
      </div>

      <div className="mb-6 relative z-10">
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

      <div className="relative z-10">
        <h3 className="text-lg font-medium text-foreground mb-2 tracking-tight">
          AI 写作助手
        </h3>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs leading-relaxed">
          我可以帮你续写剧情、优化文字、润色对话，让创作更轻松
        </p>
      </div>
    </div>
  )
}
