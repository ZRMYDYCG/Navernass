import { Trash2 } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full blur-2xl opacity-50" />
        <div className="relative w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Trash2 className="w-12 h-12 text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        回收站是空的
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
        归档的小说会保留在这里，你可以随时恢复或永久删除它们
      </p>
    </div>
  )
}
