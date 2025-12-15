'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import FeaturesCard from './features-card'

export default function Features() {
  return (
    <section
      id="features"
      className="pt-32 pb-20 relative overflow-hidden min-h-screen flex items-center bg-background
      "
    >
      {/* 柔和纸纹背景 */}
      <div className="absolute inset-0 bg-paper-texture opacity-20 pointer-events-none" />

      {/* 顶部淡渐变，让标题更清晰 */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/80 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          {/* 主标题 */}
          <h2 className="
            text-3xl md:text-4xl font-serif font-medium
            text-foreground/80 tracking-wide
          "
          >
            为创作者留下一方安静的书写角落
          </h2>

          {/* 副句 */}
          <p className="
            mt-4 text-sm font-serif italic text-foreground/50
            max-w-xl mx-auto leading-relaxed
          "
          >
            每一个功能，都像放在桌边的小工具——温柔、不喧闹，只为让你写得更自在。
          </p>

          {/* 细线分隔 */}
          <div className="mt-8 w-14 h-[1.5px] bg-foreground/10 mx-auto rounded-full" />
        </motion.div>

        {/* 功能卡片 */}
        <FeaturesCard />
      </div>
    </section>
  )
}
