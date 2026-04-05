'use client'

import type { NovelFormData } from '@/app/(main)/novels/types'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { NovelDialog } from '@/app/(main)/novels/_components/novel-dialog'
import { Button } from '@/components/ui/button'
import { Highlighter } from '@/components/ui/highlighter'
import { useAuth } from '@/hooks/use-auth'
import { useI18n } from '@/hooks/use-i18n'
import { novelsApi } from '@/lib/supabase/sdk'

const LazyTiptapEditor = dynamic(
  () => import('@/components/tiptap').then(mod => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => <HeroEditorSkeleton />,
  },
)

function HeroEditorSkeleton() {
  return (
    <div className="h-full w-full rounded-md p-4">
      <div className="mx-auto flex h-full max-w-[65ch] flex-col gap-3">
        <div className="h-4 w-1/2 rounded-sm bg-muted-foreground/20" />
        <div className="h-4 w-full rounded-sm bg-muted-foreground/10" />
        <div className="h-4 w-5/6 rounded-sm bg-muted-foreground/10" />
        <div className="mt-2 h-4 w-2/3 rounded-sm bg-muted-foreground/5" />
        <div className="h-4 w-full rounded-sm bg-muted-foreground/5" />
        <div className="h-4 w-4/5 rounded-sm bg-muted-foreground/5" />
      </div>
    </div>
  )
}

function HeroEditor({
  shouldRenderEditor,
  placeholder,
  sampleContent,
}: {
  shouldRenderEditor: boolean
  placeholder: string
  sampleContent: string
}) {
  return (
    <div className="mx-auto relative w-full max-w-4xl">
      <div className="h-[400px] w-full rounded-lg border border-border bg-background p-2 sm:h-[500px]">
        {shouldRenderEditor
          ? (
              <LazyTiptapEditor
                placeholder={placeholder}
                content={sampleContent}
                className="[&_.ProseMirror]:max-w-[65ch] [&_.ProseMirror]:mx-auto [&_.ProseMirror]:h-[380px] sm:[&_.ProseMirror]:h-[480px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:scrollbar-none [&_.ProseMirror::-webkit-scrollbar]:hidden [&_.ProseMirror::selection]:bg-primary/20 [&_.ProseMirror::selection]:text-foreground"
              />
            )
          : <HeroEditorSkeleton />}
      </div>
    </div>
  )
}

export default function Hero() {
  const { user } = useAuth()
  const router = useRouter()
  const { t } = useI18n()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [shouldRenderEditor, setShouldRenderEditor] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShouldRenderEditor(true)
    }, 800)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const handleSave = useCallback(async (data: NovelFormData) => {
    try {
      const novel = await novelsApi.create({
        title: data.title,
        description: data.description || undefined,
      })
      toast.success(t('marketing.toast.createSuccess'))
      setDialogOpen(false)
      router.push(`/editor?id=${novel.id}`)
    } catch {
      toast.error(t('marketing.toast.createFailed'))
      throw new Error(t('marketing.toast.createFailed'))
    }
  }, [router, t])

  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-background px-4 pt-20 selection:bg-primary/10 selection:text-primary md:px-6">
      <div className="pointer-events-none absolute inset-0 hidden dark:block">
        <div className="absolute top-[8%] left-[5%] h-px w-[90%] rotate-[-12deg] animate-pulse bg-gradient-to-r from-transparent via-primary/50 to-transparent [animation-duration:3s]" />
        <div className="absolute top-[18%] right-[0%] h-px w-[85%] rotate-[8deg] animate-pulse bg-gradient-to-r from-transparent via-primary/40 to-transparent [animation-delay:1s] [animation-duration:4s]" />
        <div className="absolute top-[45%] left-[0%] h-px w-[75%] rotate-[-5deg] animate-pulse bg-gradient-to-r from-transparent via-primary/45 to-transparent [animation-delay:.5s] [animation-duration:3.5s]" />
        <div className="absolute top-[65%] right-[5%] h-px w-[80%] rotate-[6deg] animate-pulse bg-gradient-to-r from-transparent via-primary/35 to-transparent [animation-delay:1.5s] [animation-duration:4.5s]" />
        <div className="absolute top-[85%] left-[10%] h-px w-[70%] rotate-[-3deg] animate-pulse bg-gradient-to-r from-transparent via-primary/30 to-transparent [animation-delay:2s] [animation-duration:5s]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <h1 className="font-serif text-3xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          {t('marketing.hero.titlePart1')}
          <Highlighter action="underline" color="var(--primary)">{t('marketing.hero.highlight1')}</Highlighter>
          <span>{t('marketing.hero.connector')}</span>
          <Highlighter action="underline" color="var(--primary)">{t('marketing.hero.highlight2')}</Highlighter>
        </h1>

        <p className="mt-4 mx-auto max-w-2xl px-2 text-base font-light leading-relaxed text-foreground/60 sm:px-0 sm:text-xl">
          {t('marketing.hero.description')}
        </p>

        {user
          ? (
              <div className="my-8">
                <Button onClick={() => setDialogOpen(true)} className="cursor-pointer px-4 sm:px-6">
                  {t('marketing.hero.cta')}
                </Button>
              </div>
            )
          : <div className="mx-auto mt-8 h-[1.5px] w-14 rounded-full bg-foreground/10" />}
      </div>

      <div className="relative z-10 pt-8 sm:pt-10">
        <HeroEditor
          shouldRenderEditor={shouldRenderEditor}
          placeholder={t('marketing.hero.editorPlaceholder')}
          sampleContent={t('marketing.hero.sampleContent')}
        />
      </div>

      {user && (
        <NovelDialog
          open={dialogOpen}
          novel={null}
          onOpenChange={setDialogOpen}
          onSave={handleSave}
        />
      )}
    </section>
  )
}
