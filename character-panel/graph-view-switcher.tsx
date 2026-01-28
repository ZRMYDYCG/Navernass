import type { ViewMode } from '@/store/characterGraphStore'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'
import { cn } from '@/lib/utils'

interface GraphViewSwitcherProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
  className?: string
}

export function GraphViewSwitcher({ value, onChange, className }: GraphViewSwitcherProps) {
  return (
    <div className={cn('rounded-full border border-border/70 bg-white/90 px-2 py-1 shadow-sm backdrop-blur', className)}>
      <SegmentedControl value={value} onValueChange={val => onChange(val as ViewMode)} size="sm">
        <SegmentedControlItem value="force">Force</SegmentedControlItem>
        <SegmentedControlItem value="dialogue">Dialogue</SegmentedControlItem>
        <SegmentedControlItem value="chord">Chord</SegmentedControlItem>
      </SegmentedControl>
    </div>
  )
}
