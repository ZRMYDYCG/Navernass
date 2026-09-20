'use client'

import { useSyncExternalStore } from 'react'

/**
 * 检测媒体查询是否匹配
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: (matches: boolean) => void) => {
    const media = window.matchMedia(query)
    const listener = () => callback(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }

  const getSnapshot = () => window.matchMedia(query).matches
  const getServerSnapshot = () => false

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * 检测是否为移动端（宽度小于 768px）
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)')
}
