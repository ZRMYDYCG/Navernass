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

const HERO_SAMPLE_CONTENT = `## 草堆里的春天

> 林小满遇到程慢的时候，两人都刚刚在这座铁锈色的城市里失去了自己的第一个家。

![](/537d9587f95332ebe6b78f717f310014.jpg)

那年冬天特别冷。小满住的阁楼暖气坏了，她裹着三件毛衣改图纸；程慢被房东赶出来，拖着一只褪色的帆布箱在雪地里找青年旅社。他们在24小时便利店的关东煮锅前相遇，一个想买最后一颗鱼丸，一个正伸手去拿，指尖在热气里碰在了一起。

"你先。"程慢缩回手，声音有点哑。

小满看着他青白的脸色，把那颗鱼丸连汤带碗推过去："我请你。"

后来程慢总说，那是他吃过最暖的一顿饭。小满笑他傻，他却认真地说："你不懂，那天我差点就想把行李箱扔进河里，自己跟着跳下去。"

他们顺理成章地合租了城郊最便宜的平房，一起对付漏雨的房顶、会跳舞的蟑螂和永远修不好的煤气灶。小满在设计公司熬夜画稿，程慢骑着电瓶车在风雨里送外卖。最穷的时候，两人分一包方便面，他喝汤她吃面，还要猜拳决定谁吃那颗蛋。

“等我们有钱了，”程慢总这么说，“就去租个大房子，有朝南的窗户，能晒到太阳。”

小满从不附和。她太知道这座城市如何吞噬诺言。第三年春天，她果然得到了去南方的机会，高薪，精装公寓，阳光满地。

离开前一晚，她收拾行李，程慢蹲在门外修一辆坏掉的自行车。链条卡得死死的，他弄了满手油污，怎么都修不好。小满隔着窗看他笨拙的背影，忽然泪如雨下。

她终究还是走了。南站的风很大，程慢塞给她一个热烘烘的烤红薯，什么也没说。

小满在南方的事业很顺，顺到她都忘了那个漏雨的平房。直到第二年冬天，母亲去世，她连夜赶回来，在殡仪馆门口看见程慢。他不知从哪儿得到的消息，揣着一保温壶的姜汤，在雪地里站了整整五个小时，胡子拉碴，眼睛通红。

“你怎么……”

“我怕你冷。”他瓮声瓮气地说。

那天晚上，他们回到早已退租的平房旧址。老房子拆了，变成一片空地，只剩一堆枯草。他们窝在草堆里，程慢从怀里掏出一个小盒子，里面是两枚易拉罐拉环做成的戒指。

“我知道你不喜欢老鼠，”他结结巴巴地说，“但我一直觉得，我们俩就像老鼠。不起眼，不聪明，但总能在墙缝里找到自己的路。小满，我买不起大房子，也学不会说漂亮话。我只会修自行车、煮方便面、在雪地里等你。你要是愿意，我想做一只笨老鼠，守着你，守一辈子。”

小满看着他冻得开裂的手，眼泪一滴滴掉下来。

她想起了这些年所有的艰辛：被客户骂哭的深夜、交不起房租的窘迫、一个人吃年夜饭的孤单。可她也想起了那碗关东煮的热气、分食的面条、修不好的自行车，还有这个傻子在雪地里站了五个小时的身影。

原来最珍贵的，从来不是朝南的窗户，而是有人愿意在风雪里为你揣着一壶姜汤。

她伸出手，让他把拉环套在自己无名指上。

“程慢，”她轻声说，“如果有来世，就让我们做一对小小的老鼠，笨笨的相爱，呆呆的过日子，拙拙的相守，傻傻的在一起。即使大雪封山，还可以窝在暖暖的草堆，紧紧地抱着你，轻轻地咬你的耳朵。”

程慢愣了愣，然后笑了，笑着笑着就哭了。

雪还在下，草堆里却有了春天的温度。
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
              className="[&_.ProseMirror]:max-w-[65ch] [&_.ProseMirror]:mx-auto [&_.ProseMirror]:h-[480px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:scrollbar-none [&_.ProseMirror::-webkit-scrollbar]:hidden [&_.ProseMirror::selection]:bg-stone-200/60 [&_.ProseMirror::selection]:text-stone-900 dark:[&_.ProseMirror::selection]:bg-stone-600/50 dark:[&_.ProseMirror::selection]:text-stone-100"
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
            className="[&_.ProseMirror]:max-w-[65ch] [&_.ProseMirror]:mx-auto [&_.ProseMirror]:h-[480px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:scrollbar-none [&_.ProseMirror::-webkit-scrollbar]:hidden [&_.ProseMirror::selection]:bg-stone-200/60 [&_.ProseMirror::selection]:text-stone-900 dark:[&_.ProseMirror::selection]:bg-stone-600/50 dark:[&_.ProseMirror::selection]:text-stone-100"
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
