'use client'

interface AIMenuRightProps {
  onPresetAction: (prompt: string) => void
  isLoading: boolean
}

interface MenuItem {
  label: string
  prompt: string
  icon: string
}

const menuItems: MenuItem[] = [
  { label: '丰富内容', prompt: '丰富内容', icon: '☰' },
  { label: '精简内容', prompt: '精简内容', icon: '÷' },
  { label: '修改标点符号', prompt: '修改标点符号', icon: '"' },
  { label: '翻译', prompt: '翻译', icon: '💬' },
  { label: '继续写', prompt: '继续写', icon: '✏️' },
]

export function AIMenuRight({ onPresetAction, isLoading }: AIMenuRightProps) {
  const handleClick = (item: MenuItem) => {
    if (!isLoading) {
      onPresetAction(item.prompt)
    }
  }

  return (
    <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl w-[200px] overflow-hidden">
      <div className="py-1">
        {menuItems.map(item => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleClick(item)}
            disabled={isLoading}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
