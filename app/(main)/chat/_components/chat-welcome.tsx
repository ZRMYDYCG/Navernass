'use client'

import { useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'

interface ChatWelcomeProps {
  isLoading?: boolean
}

function getGreetingKey() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return 'morning'
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon'
  } else if (hour >= 18 && hour < 22) {
    return 'evening'
  } else {
    return 'night'
  }
}

export function ChatWelcome({ isLoading = false }: ChatWelcomeProps) {
  const { t } = useI18n()
  const [greetingKey] = useState(() => getGreetingKey())
  const greeting = t(`chat.welcome.greetings.${greetingKey}`)

  return (
    <div className="text-center mb-3 space-y-6">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          {greeting}
          {t('chat.welcome.questionSuffix')}
        </h1>

        <p className="text-lg text-muted-foreground">
          {isLoading ? t('chat.welcome.creating') : t('chat.welcome.tip')}
        </p>
      </div>
    </div>
  )
}
