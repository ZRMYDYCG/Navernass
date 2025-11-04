import { Download, ScanEye, Upload } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function WorkspaceTab() {
  return (
    <div className="h-full flex flex-col">
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">工作区</h2>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full p-4 space-y-4">
        {/* 操作按钮 */}
        <div className="space-y-2 flex gap-4">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Download className="w-4 h-4" />
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
              <Upload className="w-4 h-4" />
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
              <ScanEye className="w-4 h-4" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded">
                预览
                <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>

        {/* 章节信息 */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">章节信息</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">字数</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">3,245</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">段落</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">28</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">创建时间</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">2024-01-15</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">最后编辑</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">5分钟前</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
