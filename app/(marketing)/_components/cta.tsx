'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ctaConfig } from '../config'
import { PaperSheet, StickyNote } from './paper-elements'
import { RoughAnnotation } from './rough-annotation'
import TechStack from './tech-stack'

export default function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-paper-texture opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <PaperSheet
            className="p-8 md:p-16"
            stackCount={3}
            tape
            rotation={1}
          >
            <div className="flex flex-col items-center text-center gap-8">
              <h2 className="text-4xl md:text-5xl font-bold text-letterpress">
                {ctaConfig.title}
              </h2>

              <div className="w-full py-8 border-y border-dashed border-foreground/10">
                <TechStack />
              </div>

              <motion.div
                className="text-lg text-muted-foreground leading-relaxed space-y-4 max-w-2xl"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <p>
                  这个项目是我们团队从
                  {' '}
                  <RoughAnnotation>
                    <span className="font-semibold text-foreground">0 到 1</span>
                  </RoughAnnotation>
                  {' '}
                  创造的，经过了很多设计和推翻...
                </p>

                <StickyNote color="yellow" rotation={-2} className="inline-block mx-2 align-middle text-foreground my-2 md:my-0">
                  🐛 欢迎找 Bug!
                </StickyNote>

                <p className="mt-2">
                  希望大家能够及时在
                  {' '}
                  {/* TODO: 添加 github 链接 */}
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-foreground hover:underline decoration-2 decoration-wavy underline-offset-4"
                  >
                    GitHub
                  </a>
                  {' '}
                  反馈。更希望大家能提交 PR，共同构建强大的
                  {' '}
                  <RoughAnnotation>
                    <span className="font-semibold text-foreground">小说创作平台</span>
                  </RoughAnnotation>
                  ！
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-4"
              >
                <Button size="lg" asChild className="h-14 px-8 text-lg rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-foreground hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-foreground text-background hover:bg-background hover:text-foreground">
                  <a
                    href={ctaConfig.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ctaConfig.ctaText}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </motion.div>
            </div>
          </PaperSheet>
        </div>
      </div>
    </section>
  )
}
