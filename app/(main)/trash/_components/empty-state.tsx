import { Trash2 } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-background dark:from-muted dark:to-card rounded-full blur-2xl opacity-50" />
        <div className="relative w-24 h-24 rounded-full bg-muted flex items-center justify-center">
          <Trash2 className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        回收站是空的
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        归档的小说会保留在这里，你可以随时恢复或永久删除它们
      </p>
    </div>
  )
}
