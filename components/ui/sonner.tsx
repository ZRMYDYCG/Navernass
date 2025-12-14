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
      style={
        {
          '--normal-bg': '#FDFBF7',
          '--normal-text': '#44403C',
          '--normal-border': '#E7E5E4',
          '--normal-border-radius': '12px',
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: '#FDFBF7',
          color: '#44403C',
          border: '1px solid #E7E5E4',
          borderRadius: '12px',
          fontFamily: 'Merriweather, Georgia, serif',
          fontSize: '14px',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
