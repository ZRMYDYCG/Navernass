'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'

interface AIInputBoxProps {
  show: boolean
  onToggle: () => void
  onClose: () => void
  prompt: string
  onPromptChange: (prompt: string) => void
  onSubmit: () => void
  isLoading: boolean
  hasActiveConversation: boolean
}

export function AIInputBox({
  show,
  onToggle,
  onClose,
  prompt,
  onPromptChange,
  onSubmit,
  isLoading,
  hasActiveConversation,
}: AIInputBoxProps) {
  const { resolvedTheme } = useTheme()
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!show
        ? (
            <motion.button
              key="collapsed"
              type="button"
              onClick={onToggle}
              disabled={isLoading}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-card border border-border rounded shadow-lg hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Star className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-foreground">{t('tiptap.aiMenu.input.collapsedLabel')}</span>
              <div className="ml-auto">
                {mounted
                  ? (
                      <Image
                        src={isDark ? '/assets/svg/logo-dark.svg' : '/assets/svg/logo-light.svg'}
                        alt={t('tiptap.aiMenu.input.logoAlt')}
                        width={12}
                        height={12}
                        className="object-contain"
                      />
                    )
                  : (
                      <div className="w-3 h-3 bg-muted rounded animate-pulse" />
                    )}
              </div>
            </motion.button>
          )
        : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-popover border border-border rounded shadow-xl w-[320px] overflow-hidden origin-top"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-border">
                <Star className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={prompt}
                  onChange={e => onPromptChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      onSubmit()
                    }
                  }}
                  placeholder={t('tiptap.aiMenu.input.placeholder')}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-xs text-popover-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                  autoFocus
                />
                <div className="flex items-center gap-1.5">
                  <div className="flex-shrink-0">
                    {isLoading
                      ? (
                          <div className="flex items-center gap-0.5" role="status" aria-label={t('tiptap.aiMenu.input.generatingAria')}>
                            <span
                              className="w-1 h-1 rounded-full bg-muted-foreground/70 animate-bounce"
                              style={{ animationDelay: '0ms' }}
                            />
                            <span
                              className="w-1 h-1 rounded-full bg-muted-foreground/70 animate-bounce"
                              style={{ animationDelay: '120ms' }}
                            />
                            <span
                              className="w-1 h-1 rounded-full bg-muted-foreground/70 animate-bounce"
                              style={{ animationDelay: '240ms' }}
                            />
                          </div>
                        )
                      : mounted
                        ? (
                            <Image
                              src={isDark ? '/assets/svg/logo-dark.svg' : '/assets/svg/logo-light.svg'}
                              alt={t('tiptap.aiMenu.input.logoAlt')}
                              width={12}
                              height={12}
                              className="object-contain"
                            />
                          )
                        : (
                            <div className="w-3 h-3 bg-muted rounded animate-pulse" />
                          )}
                  </div>
                  {!isLoading && (
                    <button
                      type="button"
                      onClick={handleCloseClick}
                      className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 hover:bg-accent rounded"
                      title={hasActiveConversation ? t('tiptap.aiMenu.input.closeConfirmPrompt') : t('tiptap.aiMenu.input.close')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
    </AnimatePresence>
  )
}
