'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Github } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ctaConfig } from '../config'

export default function CTA() {
  return (
    <section className="relative py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {ctaConfig.title}
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {ctaConfig.subtitle}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button size="lg" asChild className="min-w-[200px]">
              <Link href={ctaConfig.href}>
                {ctaConfig.ctaText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-w-[200px]">
              <a
                href="https://github.com/narraverse/narraverse-next-mvp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4 mr-2" />
                贡献代码
              </a>
            </Button>
          </motion.div>

          <motion.p
            className="mt-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            MIT 开源协议 · 永久免费 · 社区驱动
          </motion.p>
        </div>
      </div>
    </section>
  )
}
