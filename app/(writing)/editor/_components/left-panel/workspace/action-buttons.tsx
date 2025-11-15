import * as Tooltip from '@radix-ui/react-tooltip'
import { Download, ScanEye, Upload } from 'lucide-react'

export function ActionButtons() {
  return (
    <div className="space-y-2 flex gap-4">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
            <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded">
            导入章节
            <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
            <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded">
            导出章节
            <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
            <ScanEye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded">
            预览
            <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </div>
  )
}
