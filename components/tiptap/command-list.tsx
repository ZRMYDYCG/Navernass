import type { CommandItem } from './extensions/slash-command'
import { useEffect, useImperativeHandle, useState } from 'react'

export interface CommandListProps {
  items: CommandItem[]
  command: (item: CommandItem) => void
}

export interface CommandListRef {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean
}

export function CommandList({ ref, ...props }: CommandListProps & { ref?: React.RefObject<CommandListRef | null> }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  useEffect(() => {
    if (selectedIndex >= props.items.length) {
      const timer = setTimeout(() => {
        setSelectedIndex(0)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [props.items.length, selectedIndex])

  if (props.items.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <div className="text-sm text-gray-500 dark:text-gray-400">没有找到匹配的命令</div>
      </div>
    )
  }

  const categorizedItems = props.items.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const category = item.category || 'basic'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {})

  const categoryLabels: Record<string, string> = {
    ai: 'Narraverse AI Commands',
    format: '格式',
    basic: '基础',
  }

  return (
    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden max-h-80 overflow-y-auto">
      {Object.entries(categorizedItems).map(([category, items]) => (
        <div key={category} className="py-1">
          <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900/50">
            {categoryLabels[category] || category}
          </div>
          {items.map((item) => {
            const globalIndex = props.items.indexOf(item)
            const isSelected = globalIndex === selectedIndex

            return (
              <button
                type="button"
                key={`${category}-${item.title}`}
                onClick={() => selectItem(globalIndex)}
                className={`w-full text-left px-3 py-2 flex items-start gap-3 transition-colors ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-gray-100'
                }`}
              >
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <item.icon className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
                {isSelected && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 flex-shrink-0">
                    ↵
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

CommandList.displayName = 'CommandList'
