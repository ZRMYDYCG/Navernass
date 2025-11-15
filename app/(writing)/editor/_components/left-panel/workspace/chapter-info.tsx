const CHAPTER_STATS = [
  { label: '字数', value: '3,245' },
  { label: '段落', value: '28' },
  { label: '创建时间', value: '2024-01-15' },
  { label: '最后编辑', value: '5分钟前' },
]

export function ChapterInfo() {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">章节信息</h3>
      <div className="space-y-2">
        {CHAPTER_STATS.map(stat => (
          <div key={stat.label} className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{stat.label}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
