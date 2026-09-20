'use client'

import { createContext, use } from 'react'

export const SidebarToggleContext = createContext<(() => void) | null>(null)

export function useSidebarToggle() {
  const toggle = use(SidebarToggleContext)
  return toggle
}
