import type { LeftTabType } from './types'
import * as Tooltip from '@radix-ui/react-popover'
import { TAB_CONFIGS } from './constants'

interface TabSwitcherProps {
  activeTab: LeftTabType
  onChange: (tab: LeftTabType) => void
}

export function TabSwitcher({ activeTab, onChange }: TabSwitcherProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800">
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
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
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
