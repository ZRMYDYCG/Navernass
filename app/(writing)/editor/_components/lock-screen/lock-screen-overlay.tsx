'use client'

import { Lock, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { setLocked } from './utils'

interface LockScreenOverlayProps {
  onUnlock: () => void
}

export function LockScreenOverlay({ onUnlock }: LockScreenOverlayProps) {
  const handleUnlock = () => {
    setLocked(false)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('lockScreenChange'))
    }
    onUnlock()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-card rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center shadow-inner">
              <Lock className="w-7 h-7 text-muted-foreground" />
            </div>
          </div>

          <h2 className="text-xl font-medium text-foreground text-center mb-2">
            屏幕已锁定
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            点击下方按钮解锁继续创作
          </p>

          <Button
            onClick={handleUnlock}
            className="w-full h-11 bg-primary hover:opacity-90 text-primary-foreground rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <Unlock className="w-4 h-4 mr-2" />
            解锁
          </Button>
        </div>
      </div>
    </div>
  )
}
