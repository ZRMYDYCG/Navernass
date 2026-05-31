'use client'

import type { ReactNode } from 'react'
import { AdminGuard } from './admin-guard'
import { AdminSidebar } from './admin-sidebar'

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex h-screen bg-background text-foreground">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {children}
        </div>
      </div>
    </AdminGuard>
  )
}
