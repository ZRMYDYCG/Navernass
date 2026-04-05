'use client'

import type { RefObject } from 'react'
import type { Message } from '@/lib/supabase/sdk/types'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'

import { useI18n, useLocale } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface ShareImageRendererProps {
  messages: Message[]
  title?: string
  containerRef: RefObject<HTMLDivElement | null>
}

export function ShareImageRenderer({ messages, title, containerRef }: ShareImageRendererProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { t } = useI18n()
  const { locale } = useLocale()

  const timestamp = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date())
    } catch {
      return new Date().toLocaleString()
    }
  }, [locale])

  const logoSrc = isDark ? '/assets/svg/logo-dark.svg' : '/assets/svg/logo-dark.svg'
  const footerLogoSrc = isDark ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'

  return (
    <div ref={containerRef} className="absolute -left-[1200px] top-0 pointer-events-none select-none" style={{ visibility: 'hidden', zIndex: -9999 }}>
      <div className={cn(
        'w-[1080px] rounded-[48px] overflow-hidden',
        isDark
          ? 'bg-zinc-900 text-white border border-zinc-800 shadow-[0_50px_140px_rgba(0,0,0,0.6)]'
          : 'bg-white text-gray-900 border border-gray-200 shadow-[0_50px_140px_rgba(0,0,0,0.1)]',
      )}
      >
        <div className={cn(
          'relative px-16 py-14',
          isDark
            ? 'bg-gradient-to-br from-zinc-800 via-zinc-800 to-zinc-900'
            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100',
        )}
        >
          <div className={cn(
            'absolute inset-x-12 -top-32 h-64 blur-3xl',
            isDark
              ? 'bg-[radial-gradient(circle_at_top,rgba(113,113,122,0.15),transparent)]'
              : 'bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.35),transparent)]',
          )}
          />
          <div className="relative flex items-start justify-between">
            <div className="space-y-6">
              <div className={cn(
                'inline-flex items-center gap-3 rounded-full border px-6 py-2 text-sm uppercase tracking-[0.48em]',
                isDark
                  ? 'border-zinc-700 bg-zinc-800/50 text-gray-100'
                  : 'border-indigo-200 bg-white/60 text-indigo-900',
              )}
              >
                <span>{t('chat.share.featured')}</span>
              </div>
              <div className="space-y-3">
                <div className={cn(
                  'text-[42px] leading-tight font-semibold tracking-tight',
                  isDark
                    ? 'text-white'
                    : 'text-gray-900',
                )}
                >
                  {title || t('chat.share.image.titleFallback')}
                </div>
                <p className={cn(
                  'text-lg max-w-[560px] leading-relaxed',
                  isDark ? 'text-gray-400' : 'text-gray-600',
                )}
                >
                  {t('chat.share.image.description')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className={cn(
                  'absolute inset-0 rounded-[26px] blur-2xl opacity-60',
                  isDark
                    ? 'bg-[conic-gradient(from_180deg_at_50%_50%,rgba(161,161,170,0.3),rgba(113,113,122,0.1),rgba(161,161,170,0.3))]'
                    : 'bg-[conic-gradient(from_180deg_at_50%_50%,rgba(99,102,241,0.4),rgba(79,70,229,0.2),rgba(99,102,241,0.4))]',
                )}
                />
                <div className={cn(
                  'relative w-[120px] h-[120px] rounded-[26px] flex items-center justify-center border',
                  isDark
                    ? 'bg-zinc-100 shadow-[0_20px_70px_rgba(0,0,0,0.4)] border-zinc-700'
                    : 'bg-white shadow-[0_20px_70px_rgba(79,70,229,0.25)] border-indigo-200',
                )}
                >
                  <img src={logoSrc} alt="Narraverse logo" className="w-20 h-20" crossOrigin="anonymous" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={cn(
          'px-16 py-14 space-y-8',
          isDark ? 'bg-zinc-950' : 'bg-gray-50',
        )}
        >
          <div className={cn(
            'flex items-center justify-between text-sm',
            isDark ? 'text-gray-400' : 'text-gray-500',
          )}
          >
            <span>
              {t('chat.share.image.recordedAtPrefix')}
              {timestamp}
            </span>
            <span>
              {t('chat.share.image.totalPrefix')}
              {messages.length}
              {' '}
              {t('chat.share.image.totalSuffix')}
            </span>
          </div>

          <div className="space-y-10">
            {messages.map((message, index) => {
              const isUser = message.role === 'user'
              return (
                <div key={message.id} className="flex gap-6 items-start">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-[20px] flex items-center justify-center text-base font-semibold tracking-wide',
                      isDark
                        ? isUser ? 'bg-zinc-700 text-white shadow-[0_18px_38px_rgba(0,0,0,0.3)]' : 'bg-zinc-800 text-white border border-zinc-700 shadow-[0_18px_38px_rgba(0,0,0,0.3)]'
                        : isUser ? 'bg-indigo-600 text-white shadow-[0_18px_38px_rgba(79,70,229,0.25)]' : 'bg-white text-gray-900 border border-gray-200 shadow-[0_18px_38px_rgba(0,0,0,0.08)]',
                    )}
                  >
                    {isUser ? t('chat.messages.roleUser') : t('chat.messages.roleAI')}
                  </div>
                  <div
                    className={cn(
                      'flex-1 rounded-[32px] px-10 py-8 border',
                      isDark
                        ? isUser ? 'bg-zinc-800 text-gray-100 border-zinc-700 shadow-[0_24px_70px_rgba(0,0,0,0.3)]' : 'bg-zinc-900 text-gray-100 border-zinc-800 shadow-[0_24px_70px_rgba(0,0,0,0.35)]'
                        : isUser ? 'bg-white text-gray-900 border-gray-200 shadow-[0_24px_70px_rgba(0,0,0,0.08)]' : 'bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-900 border-indigo-100 shadow-[0_24px_70px_rgba(79,70,229,0.15)]',
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-between text-sm mb-5',
                      isDark ? 'text-gray-400' : 'text-gray-600',
                    )}
                    >
                      <span>{isUser ? t('chat.share.image.userLabel') : t('chat.share.image.aiLabel')}</span>
                      <span>{t('chat.share.image.messageIndex', { index: index + 1 })}</span>
                    </div>
                    <div className="text-lg leading-8 whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className={cn(
          'px-16 py-10 flex items-center justify-between text-sm tracking-wide border-t',
          isDark
            ? 'bg-zinc-900 text-gray-400 border-zinc-800'
            : 'bg-gray-100 text-gray-600 border-gray-200',
        )}
        >
          <div className="flex items-center gap-3">
            <img src={footerLogoSrc} alt="Narraverse logo" className="w-8 h-8" crossOrigin="anonymous" />
            <span>{t('chat.share.image.footerLeft')}</span>
          </div>
          <span>{t('chat.share.image.footerRight')}</span>
        </div>
      </div>
    </div>
  )
}
