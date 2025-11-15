import { Keyboard, Settings, Zap } from 'lucide-react'

const QUICK_ACTIONS = [
  { label: '保存', shortcut: 'Ctrl+S', icon: Keyboard },
  { label: '撤销', shortcut: 'Ctrl+Z', icon: Keyboard },
  { label: '重做', shortcut: 'Ctrl+Y', icon: Keyboard },
  { label: '查找', shortcut: 'Ctrl+F', icon: Keyboard },
  { label: '替换', shortcut: 'Ctrl+H', icon: Keyboard },
  { label: '全选', shortcut: 'Ctrl+A', icon: Keyboard },
]

const EDITOR_SETTINGS = [
  { label: '自动保存', enabled: true },
  { label: '拼写检查', enabled: false },
  { label: '行号显示', enabled: true },
  { label: '自动换行', enabled: false },
]

export function ChapterInfo() {
  return (
    <div className="space-y-3">
      {/* 快速操作 */}
      <div>
        <h3 className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          快速操作
        </h3>
        <div className="space-y-1">
          {QUICK_ACTIONS.map(action => (
            <div
              key={action.label}
              className="flex items-center justify-between text-[11px] px-1.5 py-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-1.5">
                <action.icon className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{action.label}</span>
              </div>
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">
                {action.shortcut}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* 编辑器设置 */}
      <div>
        <h3 className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
          <Settings className="w-3 h-3" />
          编辑器设置
        </h3>
        <div className="space-y-1">
          {EDITOR_SETTINGS.map(setting => (
            <div
              key={setting.label}
              className="flex items-center justify-between text-[11px] px-1.5 py-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
            >
              <span className="text-gray-700 dark:text-gray-300">{setting.label}</span>
              <div
                className={`w-4 h-2.5 rounded-full transition-colors ${
                  setting.enabled
                    ? 'bg-gray-900 dark:bg-gray-100'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full bg-white dark:bg-gray-800 transition-transform ${
                    setting.enabled ? 'translate-x-1.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
