'use client'

import type { ToasterProps } from 'sonner'
import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        style: {
          background: 'var(--popover)',
          color: 'var(--popover-foreground)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          fontFamily: 'var(--font-serif)',
          fontSize: '14px',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
