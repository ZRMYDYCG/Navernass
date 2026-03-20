'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ContactDialog } from './contact-dialog'
import { RoughAnnotation } from './rough-annotation'
import TechStack from './tech-stack'

export default function CTA() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-12 overflow-x-hidden px-4 py-16 md:px-6">
        <div className="text-center text-3xl font-bold md:text-5xl">加入我们，一群高能量的人</div>
        <motion.div
          className="flex w-full flex-col gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
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
                <span className="font-semibold text-foreground">交流群</span>
              </RoughAnnotation>
              {' '}
              向我们反馈，这样也好加以改正，不断改善，成为最佳！
            </p>
            <p>
              当然我们更希望大家能够给我们更多创作方法上的分享，成为
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
          <Button size="lg" type="button" onClick={() => setDialogOpen(true)}>
            加入我们
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>
      <ContactDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
