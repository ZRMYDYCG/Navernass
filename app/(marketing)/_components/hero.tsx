'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { heroConfig } from '../config'
import Navbar from './navbar'
import HeroBackground from './hero-background'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <Navbar />
      <HeroBackground />

      <div className="relative z-40 container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="block text-foreground">{heroConfig.title.primary}</span>
            <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              {heroConfig.title.secondary}
            </span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {heroConfig.subtitle}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button size="lg" asChild className="min-w-[200px]">
              <Link href={heroConfig.ctaButtons.primary.href}>
                {heroConfig.ctaButtons.primary.text}
                <heroConfig.ctaButtons.primary.icon className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-w-[200px]">
              <a
                href={heroConfig.ctaButtons.secondary.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <heroConfig.ctaButtons.secondary.icon className="w-4 h-4 mr-2" />
                {heroConfig.ctaButtons.secondary.text}
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
