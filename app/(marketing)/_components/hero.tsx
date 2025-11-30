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
  const y = useTransform(scrollY, [0, 300], [0, -30])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8])

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

      <div className="relative z-40 container mx-auto px-4 flex-1 flex flex-col items-center justify-center pt-20">

        <motion.div
          className="relative max-w-2xl w-full mx-auto"
          style={{ y, opacity }}
        >
          <div className="relative animate-float-breathe">
            <StickyNote
              color="yellow"
              rotation={-2}
              className="min-h-[320px] sm:min-h-[400px] p-8 sm:p-12 shadow-paper-lg flex flex-col items-center text-center"
            >
              <div className="font-serif text-foreground/80 leading-relaxed text-lg sm:text-xl tracking-wide w-full h-full flex flex-col justify-center">
                <p className="mb-8 opacity-60 text-base italic">
                  {dateLabel}
                  {' '}
                  ·
                  {' '}
                  {timePeriod}
                </p>

                <div className="space-y-4 text-left pl-4 sm:pl-12 border-l-2 border-red-300/30 dark:border-red-500/20 py-2">
                  <p>
                    {heroConfig.stickyNote.content.p1}
                  </p>
                  <p>
                    {heroConfig.stickyNote.content.p2}
                  </p>
                  <p className="font-medium text-foreground">
                    {heroConfig.stickyNote.content.p3}
                    <span className="animate-cursor-blink inline-block w-0.5 h-5 bg-foreground/80 align-middle ml-1"></span>
                    ”
                  </p>
                </div>

                <div className="mt-12 pt-8 border-t border-dashed border-foreground/10 w-full flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground font-sans mb-2">
                    {heroConfig.stickyNote.prompt}
                  </p>
                  <Button size="lg" asChild className="rounded-full px-8 py-6 text-lg bg-foreground text-background hover:bg-foreground/90 transition-all duration-500 shadow-lg hover:shadow-xl hover:-translate-y-1 font-sans">
                    <Link href={heroConfig.ctaButtons.primary.href}>
                      {heroConfig.ctaButtons.primary.text}
                    </Link>
                  </Button>
                </div>
              </div>
            </StickyNote>

            <StickyNote color="blue" rotation={15} className="absolute -right-8 -top-4 w-24 h-24 sm:w-32 sm:h-32 text-xs z-[-1] opacity-60 hidden sm:flex items-center justify-center">
              <span className="font-handwriting text-lg opacity-70">
                Character:
                <br />
                {' '}
                Alice
              </span>
            </StickyNote>
            <StickyNote color="pink" rotation={-10} className="absolute -left-12 bottom-12 w-20 h-20 sm:w-28 sm:h-28 text-xs z-[-1] opacity-60 hidden sm:flex items-center justify-center">
              <span className="font-handwriting text-lg opacity-70">
                Plot
                <br />
                {' '}
                Twist?
              </span>
            </StickyNote>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-0 right-0 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span className="text-muted-foreground/40 text-sm font-sans tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-foreground/20 to-transparent mx-auto mt-2" />
        </motion.div>

      </div>
    </section>
  )
}
