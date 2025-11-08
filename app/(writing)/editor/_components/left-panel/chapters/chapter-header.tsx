import { Plus } from 'lucide-react'

interface ChapterHeaderProps {
  onCreateChapter?: () => void
  onCreateVolume?: () => void // TODO: 这里需要实现创建文件夹管理章节的功能  原因是小说创作的时候 可以有 上部 下部  OR 第几卷 第几卷
}

export function ChapterHeader({ onCreateChapter, onCreateVolume: _onCreateVolume }: ChapterHeaderProps) {
  return (
    <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">目录</h2>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onCreateChapter}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          title="新增章节"
        >
          <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}
