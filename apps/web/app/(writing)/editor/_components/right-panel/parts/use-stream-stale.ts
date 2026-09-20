'use client'

import { useEffect, useState } from 'react'

/** 流式过程中内容指纹不变超过 delayMs 视为「停顿中」（展示思考态文案） */
export function useStreamStale(
  isStreaming: boolean,
  fingerprint: string,
  delayMs = 700,
): boolean {
  const [isStale, setIsStale] = useState(false)

  useEffect(() => {
    if (!isStreaming) {
      setIsStale(false)
      return
    }
    setIsStale(false)
    const timer = window.setTimeout(() => setIsStale(true), delayMs)
    return () => window.clearTimeout(timer)
  }, [isStreaming, fingerprint, delayMs])

  return isStale
}
