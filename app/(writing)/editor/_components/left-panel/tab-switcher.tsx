import type { LeftTabType } from './types'
import { TAB_CONFIGS } from './constants'

interface TabSwitcherProps {
  activeTab: LeftTabType
  onChange: (tab: LeftTabType) => void
}

export function TabSwitcher({ activeTab, onChange }: TabSwitcherProps) {
  return (
    <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      {TAB_CONFIGS.map(tab => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors relative ${
            activeTab === tab.value
              ? 'text-gray-900 dark:text-gray-100'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          {tab.label}
          {activeTab === tab.value && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400" />
          )}
        </button>
      ))}
    </div>
  )
}
