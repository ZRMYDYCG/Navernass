import Image from 'next/image'
import { Kbd } from '@/components/ui/kbd'

export function EditorWelcome() {
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="min-h-full flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 text-muted-foreground">
          <Image
            src="/assets/svg/pen-light.svg"
            width={120}
            height={120}
            alt="Welcome"
            className="opacity-40 dark:hidden"
            priority
          />
          <Image
            src="/assets/svg/pen-dark.svg"
            width={120}
            height={120}
            alt="Welcome"
            className="opacity-40 hidden dark:block"
            priority
          />
          <p className="text-sm">选择一个章节开始编辑</p>
          <span className="flex items-center gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>+</Kbd>
            <Kbd>S</Kbd>
            <span>保存内容</span>
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>+</Kbd>
            <Kbd>E</Kbd>
            <span>切换左侧面板</span>
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>+</Kbd>
            <Kbd>L</Kbd>
            <span>切换右侧面板</span>
          </span>
        </div>
      </div>
    </div>
  )
}
