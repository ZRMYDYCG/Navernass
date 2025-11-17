import { Calendar, Sparkles, Users } from 'lucide-react'
import { useState } from 'react'
import { CharacterListDialog } from './character-list-dialog'
import { NameGeneratorDialog } from './name-generator-dialog'
import { TimelineDialog } from './timeline-dialog'

interface WritingToolsProps {
  novelId: string
  onOpenNameGenerator?: () => void
  onOpenTimeline?: () => void
  onOpenCharacterList?: () => void
}

export function WritingTools({
  novelId,
  onOpenNameGenerator,
  onOpenTimeline,
  onOpenCharacterList,
}: WritingToolsProps) {
  const [nameGeneratorOpen, setNameGeneratorOpen] = useState(false)
  const [characterListOpen, setCharacterListOpen] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)

  const tools = [
    {
      id: 'name-generator',
      label: '随机名字',
      icon: Sparkles,
      onClick: () => {
        if (onOpenNameGenerator) {
          onOpenNameGenerator()
        } else {
          setNameGeneratorOpen(true)
        }
      },
    },
    {
      id: 'character-list',
      label: '角色列表',
      icon: Users,
      onClick: () => {
        if (onOpenCharacterList) {
          onOpenCharacterList()
        } else {
          setCharacterListOpen(true)
        }
      },
    },
    {
      id: 'timeline',
      label: '时间线',
      icon: Calendar,
      onClick: () => {
        if (onOpenTimeline) {
          onOpenTimeline()
        } else {
          setTimelineOpen(true)
        }
      },
    },
  ]

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 px-1">
        写作工具
      </h3>
      <div className="grid grid-cols-2 gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <div
              key={tool.id}
              role="button"
              tabIndex={-1}
              onClick={() => {
                tool.onClick()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  tool.onClick()
                }
              }}
              className="h-7 text-xs flex items-center justify-center cursor-pointer bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-md transition-colors select-none outline-none focus:outline-none focus-visible:outline-none"
            >
              <Icon className="w-3 h-3 mr-1" />
              {tool.label}
            </div>
          )
        })}
      </div>

      {/* 名字生成器对话框 */}
      <NameGeneratorDialog
        open={nameGeneratorOpen}
        onOpenChange={setNameGeneratorOpen}
      />

      {/* 角色列表对话框 */}
      <CharacterListDialog
        open={characterListOpen}
        onOpenChange={setCharacterListOpen}
        novelId={novelId}
      />

      {/* 时间线对话框 */}
      <TimelineDialog
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        novelId={novelId}
      />
    </div>
  )
}
