import type { NovelCharacter } from '@/lib/supabase/sdk'

export interface CharacterNameSuggestListProps {
  items: NovelCharacter[]
  query: string
  selectedIndex: number
  onSelectIndex: (index: number) => void
  onHoverIndex?: (index: number) => void
}

export function CharacterNameSuggestList(props: CharacterNameSuggestListProps) {
  const selectedIndex = Math.min(Math.max(props.selectedIndex, 0), Math.max(props.items.length - 1, 0))

  if (props.items.length === 0) {
    return null
  }

  return (
    <div className="overflow-hidden min-w-44 max-w-72">
      <div className="px-2.5 py-1.5 text-[11px] text-muted-foreground bg-accent/50">
        角色名联想：
        {' '}
        <span className="font-medium text-foreground">{props.query}</span>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {props.items.map((item, index) => {
          const isSelected = index === selectedIndex
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => props.onSelectIndex(index)}
              onMouseEnter={() => props.onHoverIndex?.(index)}
              className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between gap-2 transition-colors ${
                isSelected
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50 text-popover-foreground'
              }`}
            >
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{item.name}</div>
                {!!item.role && (
                  <div className="text-[11px] text-muted-foreground truncate">{item.role}</div>
                )}
              </div>
              {isSelected && (
                <div className="text-xs text-muted-foreground shrink-0">
                  Tab/↵
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

CharacterNameSuggestList.displayName = 'CharacterNameSuggestList'
