'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ctaConfig } from '../config'
import { RoughAnnotation } from './rough-annotation'
import TechStack from './tech-stack'

export default function CTA() {
  return (
    <section className="flex flex-col justify-center max-w-[88%] items-center py-16 gap-12 mx-auto">
      <motion.div
        className="flex flex-col text-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{ctaConfig.title}</h2>
        <TechStack />
        <div className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed space-y-3">
          <p>
            这个项目是我们团队从
            {' '}
            <RoughAnnotation>
              <span className="font-semibold text-foreground">0 到 1</span>
            </RoughAnnotation>
            {' '}
            创造的，经过了很多设计和推翻，开了很多很多会议，才有了现在的样子
          </p>
          <p>
            一个小团队的精力是有限的，项目可能会存在一些隐藏的
            {' '}
            <RoughAnnotation>
              <span className="font-semibold text-foreground">BUG</span>
            </RoughAnnotation>
          </p>
          <p>
            希望大家能够及时在
            {' '}
            <RoughAnnotation>
              <a
                href="https://github.com/narraverse/narraverse-next-mvp"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:underline"
              >
                GitHub
              </a>
            </RoughAnnotation>
            {' '}
            向我们反馈，这样也好加以改正，不断改善，成为最佳！
          </p>
          <p>
            当然我们更希望大家能够提交 PR 成为
            {' '}
            <RoughAnnotation>
              <span className="font-semibold text-foreground">Narraverse</span>
            </RoughAnnotation>
            {' '}
            的贡献者
          </p>
          <p>
            大家一起参与进来，构建一个强大的
            {' '}
            <RoughAnnotation>
              <span className="font-semibold text-foreground">小说创作平台</span>
            </RoughAnnotation>
            ！
          </p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Button size="lg" asChild>
          <a
            href={ctaConfig.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {ctaConfig.ctaText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </motion.div>
    </section>
  )
}
