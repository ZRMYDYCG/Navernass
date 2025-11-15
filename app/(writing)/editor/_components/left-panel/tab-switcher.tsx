import type { LeftTabType } from './types'
import { TAB_CONFIGS } from './constants'

interface TabSwitcherProps {
  activeTab: LeftTabType
  onChange: (tab: LeftTabType) => void
}

export function TabSwitcher({ activeTab, onChange }: TabSwitcherProps) {
  return (
    <div className="flex items-center justify-center py-2">
      {TAB_CONFIGS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.value

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-center rounded-md ${
              isActive
                ? 'text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
            title={tab.label}
          >
            {Icon
              ? (
                  <Icon className="w-4 h-4" />
                )
              : (
                  <span>{tab.label}</span>
                )}
          </button>
        )
      })}
    </div>
  )
}
