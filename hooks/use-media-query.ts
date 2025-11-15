'use client'

import { useEffect, useState } from 'react'

/**
 * 检测媒体查询是否匹配
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

/**
 * 检测是否为移动端（宽度小于 768px）
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)')
}
