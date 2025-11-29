'use client'

import { motion } from 'framer-motion'
import { BookText, Users, Lightbulb, Sparkles, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  {
    title: '章节与段落',
    description: '像整理书架一样管理你的故事结构，拖拽排序，清晰直观。',
    icon: BookText,
    variant: 'plain',
    decoration: 'clip',
    delay: 0.1
  },
  {
    title: '人物小记',
    description: '为每个角色建立专属档案，记录性格、外貌与不为人知的秘密。',
    icon: Users,
    variant: 'dotted',
    decoration: 'pin',
    delay: 0.2
  },
  {
    title: '灵感仓库',
    description: '随时捕捉的一闪而过的念头，都安稳地存放在这里，不再遗失。',
    icon: Lightbulb,
    variant: 'grid',
    decoration: 'tape',
    delay: 0.3
  },
  {
    title: 'AI 文稿润笔',
    description: '温和的智能助手，为你修饰辞藻，提供情节建议，而非喧宾夺主。',
    icon: Sparkles,
    variant: 'plain',
    decoration: 'none',
    delay: 0.4
  },
  {
    title: '导出印刷版✦',
    description: '一键生成精美的排版格式，支持 PDF 与实体书预览，让梦想触手可及。',
    icon: Printer,
    variant: 'lined',
    decoration: 'tape',
    delay: 0.5
  }
]

export default function Features() {
  return (
    <section id="features" className="py-32 relative overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground/80 mb-4 tracking-wide">
            让写作回归温柔的仪式
          </h2>
          <div className="w-16 h-1 bg-foreground/10 mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: feature.delay, ease: "easeOut" }}
              className="group"
            >
              <div
                className={cn(
                  "relative h-full min-h-[240px] p-8 flex flex-col transition-all duration-500 ease-in-out",
                  "bg-card/60 backdrop-blur-[2px] border border-foreground/5 rounded-sm",
                  "shadow-paper-sm hover:shadow-paper-md hover:-translate-y-1 hover:bg-card/80"
                )}
              >
                {feature.decoration === 'tape' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-yellow-100/60 dark:bg-yellow-900/20 rotate-[-1deg] border-l border-r border-white/10 pointer-events-none" />
                )}
                {feature.decoration === 'pin' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-400/80 shadow-sm border border-red-500/50 pointer-events-none" />
                )}
                {feature.decoration === 'clip' && (
                  <div className="absolute -top-2 right-6 w-4 h-8 border-2 border-foreground/20 rounded-t-full rounded-b-full pointer-events-none" />
                )}

                <div className="w-10 h-10 bg-foreground/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="w-5 h-5 text-foreground/70" />
                </div>

                <h3 className="text-xl font-bold mb-3 text-foreground/90 font-serif">{feature.title}</h3>
                <p className="text-muted-foreground/80 leading-relaxed text-sm font-sans">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
