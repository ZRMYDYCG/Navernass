'use client'

import type { NovelFormData } from '@/app/(main)/novels/types'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { NovelDialog } from '@/app/(main)/novels/_components/novel-dialog'
import { TiptapEditor } from '@/components/tiptap/index'
import { Button } from '@/components/ui/button'
import { Highlighter } from '@/components/ui/highlighter'
import { useAuth } from '@/hooks/use-auth'
import { novelsApi } from '@/lib/supabase/sdk'

export default function Hero() {
  const { user } = useAuth()
  const router = useRouter()

  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSave = useCallback(async (data: NovelFormData) => {
    try {
      const novel = await novelsApi.create({
        title: data.title,
        description: data.description || undefined,
      })
      toast.success('创建成功')
      setDialogOpen(false)
      router.push(`/editor?id=${novel.id}`)
    } catch {
      toast.error('创建失败')
      throw new Error('创建失败')
    }
  }, [router])

  if (!user) {
    return (
      <section className="min-h-screen flex justify-center flex-col overflow-hidden bg-background selection:bg-primary/10 selection:text-primary px-4 md:px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 hidden dark:block">
          <div className="absolute top-[8%] left-[5%] w-[90%] h-[0.5px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent rotate-[-12deg] animate-pulse [animation-duration:3s]" />
          <div className="absolute top-[18%] right-[0%] w-[85%] h-[0.5px] bg-gradient-to-r from-transparent via-sky-400/60 to-transparent rotate-[8deg] animate-pulse [animation-duration:4s] [animation-delay:1s]" />
          <div className="absolute top-[45%] left-[0%] w-[75%] h-[0.5px] bg-gradient-to-r from-transparent via-pink-400/50 to-transparent rotate-[-5deg] animate-pulse [animation-duration:3.5s] [animation-delay:0.5s]" />
          <div className="absolute top-[65%] right-[5%] w-[80%] h-[0.5px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent rotate-[6deg] animate-pulse [animation-duration:4.5s] [animation-delay:1.5s]" />
          <div className="absolute top-[85%] left-[10%] w-[70%] h-[0.5px] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent rotate-[-3deg] animate-pulse [animation-duration:5s] [animation-delay:2s]" />
        </div>

        <div className="max-w-4xl mx-auto text-center z-20 relative pt-16 sm:pt-20">
          <div>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground tracking-tight leading-[1.1]">
              让写作回归
              <Highlighter action="underline" color="#87CEFA">纯粹</Highlighter>
              <span>与</span>
              <Highlighter action="underline" color="#87CEFA">自由</Highlighter>
            </h1>
          </div>

          <p className="text-base sm:text-xl text-foreground/60 max-w-2xl mx-auto font-light leading-relaxed mt-4 px-2 sm:px-0">
            我们专注为才华横溢的创作者打造舒适的创作环境，降低优质内容被看见、被分享、被发掘的门槛。同时也为新手提供AI辅助，降低直面感受创作、学习创作、走进创作的门槛。
          </p>

          <div className="mt-8 w-14 h-[1.5px] bg-foreground/10 mx-auto rounded-full" />
        </div>

        <div className="mx-auto z-20 relative pt-8 sm:pt-10 w-full max-w-4xl">
          <div className="bg-background p-2 w-full border border-border rounded-lg h-[400px] sm:h-[500px]">
            <TiptapEditor
              placeholder="在这里开始你的创作之旅..."
              content="如果有来世，就让我们做一对小小的老鼠，笨笨的相爱，呆呆的过日子，拙拙的相守，傻傻的在一起。即使大雪封山，还可以窝在暖暖的草堆，紧紧地抱着你，轻轻地咬你的耳朵。"
              className="[&_.ProseMirror]:max-w-[65ch] [&_.ProseMirror]:mx-auto [&_.ProseMirror]:h-[480px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror::selection]:bg-stone-200/60 [&_.ProseMirror::selection]:text-stone-900 dark:[&_.ProseMirror::selection]:bg-stone-600/50 dark:[&_.ProseMirror::selection]:text-stone-100"
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen flex justify-center flex-col overflow-hidden bg-background selection:bg-primary/10 selection:text-primary px-4 md:px-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 hidden dark:block">
        <div className="absolute top-[8%] left-[5%] w-[90%] h-[0.5px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent rotate-[-12deg] animate-pulse [animation-duration:3s]" />
        <div className="absolute top-[18%] right-[0%] w-[85%] h-[0.5px] bg-gradient-to-r from-transparent via-sky-400/60 to-transparent rotate-[8deg] animate-pulse [animation-duration:4s] [animation-delay:1s]" />
        <div className="absolute top-[45%] left-[0%] w-[75%] h-[0.5px] bg-gradient-to-r from-transparent via-pink-400/50 to-transparent rotate-[-5deg] animate-pulse [animation-duration:3.5s] [animation-delay:0.5s]" />
        <div className="absolute top-[65%] right-[5%] w-[80%] h-[0.5px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent rotate-[6deg] animate-pulse [animation-duration:4.5s] [animation-delay:1.5s]" />
        <div className="absolute top-[85%] left-[10%] w-[70%] h-[0.5px] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent rotate-[-3deg] animate-pulse [animation-duration:5s] [animation-delay:2s]" />
      </div>

      <div className="max-w-4xl mx-auto text-center z-20 relative pt-16 sm:pt-20">
        <div>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground tracking-tight leading-[1.1]">
            让写作回归
            <Highlighter action="underline" color="#87CEFA">纯粹</Highlighter>
            <span>与</span>
            <Highlighter action="underline" color="#87CEFA">自由</Highlighter>
          </h1>
        </div>

        <p className="text-base sm:text-xl text-foreground/60 max-w-2xl mx-auto font-light leading-relaxed mt-4 px-2 sm:px-0">
          我们专注为才华横溢的创作者打造舒适的创作环境，降低优质内容被看见、被分享、被发掘的门槛。同时也为新手提供AI辅助，降低直面感受创作、学习创作、走进创作的门槛。
        </p>

        <div className="mt-8 w-14 h-[1.5px] bg-foreground/10 mx-auto rounded-full" />
        <div className="mb-8">
          <Button onClick={() => setDialogOpen(true)} className="cursor-pointer px-4 sm:px-6">
            开启创作之旅
          </Button>
        </div>
      </div>

      <div className="mx-auto z-20 relative w-full max-w-4xl">
        <div className="bg-background p-2 w-full border border-border rounded-lg h-[400px] sm:h-[500px]">
          <TiptapEditor
            placeholder="在这里开始你的创作之旅..."
            content="如果有来世，就让我们做一对小小的老鼠，笨笨的相爱，呆呆的过日子，拙拙的相守，傻傻的在一起。即使大雪封山，还可以窝在暖暖的草堆，紧紧地抱着你，轻轻地咬你的耳朵。"
            className="[&_.ProseMirror]:max-w-[65ch] [&_.ProseMirror]:mx-auto [&_.ProseMirror]:h-[480px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror::selection]:bg-stone-200/60 [&_.ProseMirror::selection]:text-stone-900 dark:[&_.ProseMirror::selection]:bg-stone-600/50 dark:[&_.ProseMirror::selection]:text-stone-100"
          />
        </div>
      </div>

      <NovelDialog
        open={dialogOpen}
        novel={null}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
    </section>
  )
}
