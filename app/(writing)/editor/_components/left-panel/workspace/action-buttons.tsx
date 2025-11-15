import * as Tooltip from '@radix-ui/react-tooltip'
import { Download, ScanEye, Upload } from 'lucide-react'

export function ActionButtons() {
  return (
    <div className="flex gap-1">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Download className="w-3 h-3" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="bg-gray-900 dark:bg-gray-700 text-white text-[11px] px-2 py-1 rounded">
            导入章节
            <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Upload className="w-3 h-3" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="bg-gray-900 dark:bg-gray-700 text-white text-[11px] px-2 py-1 rounded">
            导出章节
            <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ScanEye className="w-3 h-3" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="bg-gray-900 dark:bg-gray-700 text-white text-[11px] px-2 py-1 rounded">
            预览
            <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </div>
  )
}
