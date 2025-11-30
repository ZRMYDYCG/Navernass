import type { LeftTabType } from './types'
import { TAB_CONFIGS } from './constants'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TabSwitcherProps {
  activeTab: LeftTabType
  onChange: (tab: LeftTabType) => void
}

export function TabSwitcher({ activeTab, onChange }: TabSwitcherProps) {
  return (
    <TooltipProvider>
      <div className="h-full flex flex-col items-center gap-2 py-4 px-1">
        {TAB_CONFIGS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.value

          return (
            <Tooltip key={tab.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onChange(tab.value)}
                  className={`w-9 h-9 flex items-center justify-center rounded-md cursor-pointer text-xs transition-colors ${
                    isActive
                      ? 'bg-gray-200 text-gray-900 dark:bg-zinc-700 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-gray-100'
                  }`}
                >
                  {Icon
                    ? <Icon className="w-4 h-4" />
                    : <span>{tab.label}</span>}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <p>{tab.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
