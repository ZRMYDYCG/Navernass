'use client'

export function SearchTab() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <input
          type="text"
          placeholder="搜索章节..."
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          搜索功能开发中...
        </p>
      </div>
    </div>
  )
}
