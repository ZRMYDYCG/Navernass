'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useI18n, useLocale } from '@/hooks/use-i18n'
import { ContactDialog } from './contact-dialog'
import { RoughAnnotation } from './rough-annotation'
import TechStack from './tech-stack'

interface JoinUsParagraph {
  before: string
  highlight: string
  after: string
}

export default function CTA() {
  const { t } = useI18n()
  const { locale } = useLocale()
  const [dialogOpen, setDialogOpen] = useState(false)
  const rawParagraphs = t('marketing.joinUs.paragraphs', { returnObjects: true }) as unknown
  const paragraphs: JoinUsParagraph[] = Array.isArray(rawParagraphs)
    ? rawParagraphs as JoinUsParagraph[]
    : []
  const separator = locale === 'en-US' ? ' ' : ''

  return (
    <>
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-12 overflow-x-hidden px-4 py-16 md:px-6">
        <div className="text-center text-3xl font-bold md:text-5xl">{t('marketing.joinUs.title')}</div>
        <motion.div
          className="flex w-full flex-col gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <TechStack />
          <div className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed space-y-3">
            {paragraphs.map(({ before, highlight, after }, index) => (
              <p key={`${highlight}-${index}`}>
                {before}
                {separator}
                <RoughAnnotation>
                  <span className="font-semibold text-foreground">{highlight}</span>
                </RoughAnnotation>
                {after ? `${separator}${after}` : null}
              </p>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button size="lg" type="button" onClick={() => setDialogOpen(true)}>
            {t('marketing.joinUs.cta')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>
      <ContactDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
