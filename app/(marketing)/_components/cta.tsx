'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ctaConfig } from '../config'
import { PaperSheet, StickyNote } from './paper-elements'
import { RoughAnnotation } from './rough-annotation'
import TechStack from './tech-stack'

export default function CTA() {
  return (
    <section className="relative pb-24 overflow-hidden">
      {/* 背景纸张纹理 */}
      <div className="dark:opacity-[0.05] dark:invert absolute inset-0 bg-paper-texture opacity-20 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <PaperSheet
            className="p-8 md:p-16 bg-white dark:bg-yellow-900/5"
            stackCount={3}
            tape
            rotation={1}
          >
            <div className="flex flex-col items-center text-center gap-8">
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground/90 tracking-tight">
                {ctaConfig.title}
              </h2>

              <div className="w-full py-8 border-y border-dashed border-foreground/10">
                <TechStack />
              </div>

              <motion.div
                className="text-lg text-foreground/70 leading-relaxed space-y-4 max-w-2xl font-serif"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="space-y-4">
                  <p>
                    这个项目是我们团队从
                    {' '}
                    <RoughAnnotation>
                      <span className="font-semibold text-foreground">0 到 1</span>
                    </RoughAnnotation>
                    {' '}
                    创造的，经过了很多设计和推翻...
                  </p>

                  <div className="flex justify-center my-4">
                    <StickyNote color="yellow" rotation={-2} className="text-foreground p-3 shadow-sm text-sm font-handwriting min-h-0 w-auto">
                      🐛 欢迎找 Bug!
                    </StickyNote>
                  </div>

                  <p>
                    希望大家能够及时在
                    {' '}
                    <a
                      href={ctaConfig.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-foreground hover:underline decoration-2 decoration-wavy underline-offset-4 decoration-primary/50"
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
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <a
                  href={ctaConfig.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-14 px-10 text-lg font-medium shadow-[4px_4px_0px_0px_rgba(45,42,38,1)] border-2 border-foreground hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-foreground text-background hover:bg-background hover:text-foreground"
                >
                  {ctaConfig.ctaText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </motion.div>
            </div>
          </PaperSheet>
        </div>
      </div>
    </section>
  )
}
