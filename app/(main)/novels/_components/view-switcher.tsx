import type { ViewMode } from '../types'
import { LayoutGrid, Table } from 'lucide-react'

interface ViewSwitcherProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-secondary border border-border">
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
          value === 'grid'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="卡片视图"
        title="卡片视图"
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">卡片</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('table')}
        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
          value === 'table'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="表格视图"
        title="表格视图"
      >
        <Table className="w-4 h-4" />
        <span className="hidden sm:inline">表格</span>
      </button>
    </div>
  )
}
