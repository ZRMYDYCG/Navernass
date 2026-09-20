'use client'

import type { ViewMode } from '../types'
import { LayoutGrid, Table } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'

interface ViewSwitcherProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  const { t } = useI18n()

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-transparent border border-border">
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
          value === 'grid'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label={t('novels.view.gridAria')}
        title={t('novels.view.gridAria')}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">{t('novels.view.grid')}</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('table')}
        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
          value === 'table'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label={t('novels.view.tableAria')}
        title={t('novels.view.tableAria')}
      >
        <Table className="w-4 h-4" />
        <span className="hidden sm:inline">{t('novels.view.table')}</span>
      </button>
    </div>
  )
}
