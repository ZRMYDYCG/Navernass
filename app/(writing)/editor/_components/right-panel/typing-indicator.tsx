'use client'

import { StreamLoading } from './parts/stream-loading'

export function TypingIndicator() {
  return (
    <div className="py-1.5">
      <StreamLoading variant="card" />
    </div>
  )
}
