import type { Metadata } from 'next'
import { WifiOff } from 'lucide-react'
import { OfflineActions } from './_components/offline-actions'

export const metadata: Metadata = {
  title: 'Narraverse - 离线模式',
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-muted/30 ring-1 ring-border">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">
        您目前处于离线状态
      </h1>
      <p className="mb-8 max-w-[400px] text-muted-foreground">
        网络连接已断开。由于 Narraverse 需要实时同步您的创作数据，
        <br />
        请检查网络设置后重试。
      </p>

      <OfflineActions />

      <div className="fixed bottom-8 text-xs text-muted-foreground/60">
        Narraverse Offline Mode
      </div>
    </div>
  )
}
