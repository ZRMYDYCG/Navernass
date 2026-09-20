'use client'

import type { ComponentProps } from 'react'
import { StreamLoading } from './parts/stream-loading'

type TypingIndicatorProps = {
  tone?: ComponentProps<typeof StreamLoading>['tone']
}

export function TypingIndicator({ tone = 'streaming' }: TypingIndicatorProps) {
  return (
    <div className="py-1.5">
      <StreamLoading variant="card" tone={tone} />
    </div>
  )
}
