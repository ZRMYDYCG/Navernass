import type { RelationshipGraphViewMode } from '@/store/characterGraphStore'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'
import { cn } from '@/lib/utils'

interface GraphViewSwitcherProps {
  value: RelationshipGraphViewMode
  onChange: (value: RelationshipGraphViewMode) => void
  className?: string
}

export function GraphViewSwitcher({ value, onChange, className }: GraphViewSwitcherProps) {
  return (
    <div className={cn('rounded-full border border-border/70 bg-white/90 dark:bg-zinc-900/90 px-2 py-1 shadow-sm backdrop-blur dark:shadow-[0_0_5px_rgba(0,0,0,0.3)]', className)}>
      <SegmentedControl value={value} onValueChange={val => onChange(val as RelationshipGraphViewMode)} size="sm">
        <SegmentedControlItem value="force">Force</SegmentedControlItem>
        <SegmentedControlItem value="dialogue">Dialogue</SegmentedControlItem>
        <SegmentedControlItem value="chord">Chord</SegmentedControlItem>
      </SegmentedControl>
    </div>
  )
}
