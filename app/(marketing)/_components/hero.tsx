'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { heroConfig } from '../config'
import HeroBackground from './hero-background'
import Navbar from './navbar'
import { StickyNote } from './paper-elements'

export default function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, -20])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.85])

  const { timePeriod, dateLabel } = useMemo(() => {
    const now = new Date()
    const hour = now.getHours()
    let period = heroConfig.stickyNote.timePeriods.night
    if (hour >= 5 && hour < 12) period = heroConfig.stickyNote.timePeriods.morning
    else if (hour >= 12 && hour < 18) period = heroConfig.stickyNote.timePeriods.afternoon
    else if (hour >= 18 && hour < 22) period = heroConfig.stickyNote.timePeriods.evening
    return {
      timePeriod: period,
      dateLabel: now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }),
    }
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-background selection:bg-primary/10 selection:text-primary">
      <HeroBackground />
      <Navbar />

      {/* 主标题区域 */}
      <motion.div
        style={{ y, opacity }}
        className="max-w-4xl mx-auto text-center z-20 relative pt-24 sm:pt-32"
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground tracking-tight leading-[1.1]">
            让写作回归
            <span className="italic font-serif text-foreground/60 mx-2">纯粹</span>
            与
            <span className="italic font-serif text-foreground/60 mx-2">自由</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto font-light leading-relaxed mt-4"
        >
          {heroConfig.subtitle}
        </motion.p>
      </motion.div>

      {/* 主便签 + 侧边拼贴 */}
      <div className="relative z-40 container mx-auto px-4 flex-1 flex flex-col items-center justify-center pt-16">
        <motion.div
          className="relative w-full flex justify-center"
          style={{ y, opacity }}
        >
          <div className="relative">

            {/* 主便签漂浮动画 */}
            <motion.div
              initial={{ y: 0, scale: 0.97 }}
              animate={{ y: [0, -6, 0], scale: [0.97, 1, 0.97] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <StickyNote
                color="yellow"
                rotation={-1.5}
                className="min-h-[360px] sm:min-h-[440px] p-10 sm:p-12 shadow-paper-lg flex flex-col items-center text-center max-w-md mx-auto"
              >
                <div className="font-serif text-foreground/80 leading-relaxed text-lg sm:text-xl tracking-wide w-full h-full flex flex-col justify-center">

                  <p className="mb-8 opacity-60 text-sm italic">
                    {dateLabel}
                    {' '}
                    ·
                    {timePeriod}
                  </p>

                  <div className="space-y-4 text-left pl-4 sm:pl-10 border-l border-foreground/20 dark:border-foreground/30 py-2">
                    <p>{heroConfig.stickyNote.content.p1}</p>
                    <p>{heroConfig.stickyNote.content.p2}</p>
                    <p className="font-medium text-foreground">
                      {heroConfig.stickyNote.content.p3}
                      <span className="animate-cursor-blink inline-block w-0.5 h-5 bg-foreground/80 ml-1" />
                      ”
                    </p>
                  </div>

                  <div className="mt-10 pt-6 border-t border-dashed border-foreground/20 w-full flex flex-col items-center gap-4">
                    <p className="text-xs sm:text-sm text-muted-foreground font-sans">{heroConfig.stickyNote.prompt}</p>
                    <Button
                      size="lg"
                      asChild
                      className="rounded-full px-8 py-5 text-base sm:text-lg bg-foreground text-background hover:bg-foreground/90 transition-all duration-500 shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                      <Link href={heroConfig.ctaButtons.primary.href}>
                        {heroConfig.ctaButtons.primary.text}
                      </Link>
                    </Button>
                  </div>

                </div>
              </StickyNote>
            </motion.div>

            {/* 蓝色角色便签漂浮 + 轻微旋转 */}
            <motion.div
              initial={{ y: 0, rotate: 8, scale: 0.95 }}
              animate={{ y: [0, -6, 0], rotate: [8, 10, 8], scale: [0.95, 1, 0.95] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-6 -top-4 w-24 sm:w-32 h-24 sm:h-32 text-xs z-0 opacity-50 hidden sm:flex items-center justify-center"
            >
              <StickyNote color="blue" rotation={0} className="w-full h-full flex items-center justify-center">
                <span className="font-handwriting text-lg opacity-70 leading-snug">
                  Character
                  <br />
                  Alice
                </span>
              </StickyNote>
            </motion.div>

            {/* 粉色 Plot 便签漂浮 + 轻微旋转 */}
            <motion.div
              initial={{ y: 0, rotate: -12, scale: 0.95 }}
              animate={{ y: [0, 6, 0], rotate: [-12, -10, -12], scale: [0.95, 1, 0.95] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-10 bottom-12 w-20 sm:w-28 h-20 sm:h-28 text-xs z-0 opacity-50 hidden sm:flex items-center justify-center"
            >
              <StickyNote color="pink" rotation={0} className="w-full h-full flex items-center justify-center">
                <span className="font-handwriting text-lg opacity-70 leading-snug">
                  Plot
                  <br />
                  Twist?
                </span>
              </StickyNote>
            </motion.div>

          </div>
        </motion.div>

        {/* Scroll indicator 闪烁动画 */}
        <motion.div
          className="absolute bottom-8 left-0 right-0 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-muted-foreground/40 text-xs sm:text-sm tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-linear-to-b from-foreground/20 to-transparent mx-auto mt-2" />
        </motion.div>
      </div>

    </section>
  )
}
