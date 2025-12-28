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

const HERO_SAMPLE_CONTENT = ` ## 雨季不再来
这已不知是第几日了，我总在落着雨的早晨醒来。窗外照例是一片灰镑镑的天空，没有黎明时的曙光，没有风，没有鸟叫。后院的小树都很寥寂的静立在雨中，无论从那一个窗口望出去，总有雨水在冲流着。除了雨水之外，听不见其他的声音，在这时分里，一切全是静止的。

![](./landing-page-3.png)我胡乱的穿着衣服，想到今日的考试，想到心中挂念着的培，心情就又无端的沉落下去。而对这样的季候也无心再去咒诅它了。昨晚房中的台灯坏了，就以此为藉口，故意早早睡去，连笔记都不想碰一下，更不要说那一本本原文书了。当时客厅的电视正在上演着西部片，黑暗中，我躺在床上，偶尔会有音乐、对白和枪声传来，觉得有一丝朦胧的快乐。在那时，考试就变得极不重要，觉得那是不会有的事，明天也是不会来的。我将永远躺在这黑暗里，而培明日会不会去找我也不是问题了。不过是这个季节在烦恼着我们，明白就会好了，我们岂是真的就此分开了？这不过是雨在冲乱着我们的心绪罢了。

每次早晨醒来的时候，我总喜欢仔细的去看看自己。浴室镜子里的我是一个陌生人，那是个奇异的时分。我的心境在刚刚醒来的时候是不设防的，镜中的自己也是不设防的。我喜欢一面将手漫在水里，一面凝望着自己，奇怪的轻声叫着我的名字——今日镜中的不是我，那是个满面渴想着培的女孩。我凝望着自己，追念着培的眼睛——我常常不能抗拒的驻留在那时分里，直到我听见母亲或弟弟在另一间浴室里漱洗的水声。那时我会突然记起自己该进入的日子和秩序，我就会快快的去喝一杯蜂蜜水，然后夹着些凌乱的笔记书本出门。

今早要出去的时候，我找不到可穿的鞋子。我的鞋因为在雨地中不好好走路的缘故，已经全都湿光了。于是我只好去穿一双咖啡色的凉鞋，这件小事使得我在出门时不及想像的沉落。这凉鞋踏在清晨水湿的街道上的确是愉快的。我坐了三轮车去车站，天空仍灰得分不出时辰来。

车帘外的一切被雨弄得静悄悄的，看不出什么显然的朝气。几个小男孩在水沟里放纸船，一个拾垃圾的老人无精打采的站在人行道边，一街的人车在这灰暗的城市中无声的奔流着。我看着这些景象，心中无端的升起一层疲惫来，这是怎样令人丧气的一个日子啊。

下车付车钱时，我弄掉了笔记。当我俯身在泥泞中去拾起它时，心中就乍然的软弱无力起来。考试、培、雨、好似都没有一样的把我绞进里面去。

有一日，我要在一个充满阳光的早晨醒来。那时我要躺在床上，静静地听听窗外如洗的鸟声，那是多么安适而又快乐的一种苏醒。到时候，我早晨起来，对着镜子，我会再度看见阳光驻留在我的脸上。

我会一遍遍地告诉自己，雨季过了，雨季将不再来。我会觉得，在那一日早晨，当我出门的时候，我会穿着那双清洁干燥的黄球鞋，踏上一条充满日光的大道。

那时候，我会说，看这阳光，雨季将不再来。
`

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
              content={HERO_SAMPLE_CONTENT}
              className="[&_.ProseMirror]:max-w-[65ch] [&_.ProseMirror]:mx-auto [&_.ProseMirror]:h-[380px] sm:[&_.ProseMirror]:h-[480px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:scrollbar-none [&_.ProseMirror::-webkit-scrollbar]:hidden [&_.ProseMirror::selection]:bg-stone-200/60 [&_.ProseMirror::selection]:text-stone-900 dark:[&_.ProseMirror::selection]:bg-stone-600/50 dark:[&_.ProseMirror::selection]:text-stone-100"
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

        <div className="my-8">
          <Button onClick={() => setDialogOpen(true)} className="cursor-pointer px-4 sm:px-6">
            开启创作之旅
          </Button>
        </div>
      </div>

      <div className="mx-auto z-20 relative w-full max-w-4xl">
        <div className="bg-background p-2 w-full border border-border rounded-lg h-[400px] sm:h-[500px]">
          <TiptapEditor
            placeholder="在这里开始你的创作之旅..."
            content={HERO_SAMPLE_CONTENT}
            className="[&_.ProseMirror]:max-w-[65ch] [&_.ProseMirror]:mx-auto [&_.ProseMirror]:h-[380px] sm:[&_.ProseMirror]:h-[480px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:scrollbar-none [&_.ProseMirror::-webkit-scrollbar]:hidden [&_.ProseMirror::selection]:bg-stone-200/60 [&_.ProseMirror::selection]:text-stone-900 dark:[&_.ProseMirror::selection]:bg-stone-600/50 dark:[&_.ProseMirror::selection]:text-stone-100"
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
