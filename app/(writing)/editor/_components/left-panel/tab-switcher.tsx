import type { LeftTabType } from './types'
import * as Tooltip from '@radix-ui/react-popover'
import { TAB_CONFIGS } from './constants'

interface TabSwitcherProps {
  activeTab: LeftTabType
  onChange: (tab: LeftTabType) => void
}

export function TabSwitcher({ activeTab, onChange }: TabSwitcherProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      {TAB_CONFIGS.map((tab) => {
        const Icon = tab.icon
        return (
          <Tooltip.Root key={tab.value}>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={() => onChange(tab.value)}
                className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                  activeTab === tab.value
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="bottom"
                className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded"
                sideOffset={5}
              >
                {tab.label}
                <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        )
      })}
    </div>
  )
}
