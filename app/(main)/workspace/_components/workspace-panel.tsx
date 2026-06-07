'use client'

import type { ReactNode } from 'react'
import { PaperCard } from '@/components/ui/paper-card'
import { cn } from '@/lib/utils'

interface WorkspacePanelProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  headerExtra?: ReactNode
}

export function WorkspacePanel({
  title,
  description,
  children,
  className,
  headerExtra,
}: WorkspacePanelProps) {
  return (
    <PaperCard className={cn('bg-paper-texture', className)}>
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-serif font-medium text-balance text-foreground">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-xs text-pretty text-muted-foreground leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
          {headerExtra}
        </div>
        {children}
      </div>
    </PaperCard>
  )
}
