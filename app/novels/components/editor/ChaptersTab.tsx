import { Plus, FileText, Layers } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

interface Chapter {
  id: string;
  title: string;
  wordCount: string;
  status: string;
}

interface ChaptersTabProps {
  chapters: Chapter[];
  selectedChapter: string | null;
  onSelectChapter: (id: string) => void;
  onCreateChapter?: () => void;
  onCreateVolume?: () => void;
}

export function ChaptersTab({
  chapters,
  selectedChapter,
  onSelectChapter,
  onCreateChapter,
  onCreateVolume,
}: ChaptersTabProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">章节目录</h2>

        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[160px]"
              sideOffset={5}
              align="end"
            >
              <button
                onClick={onCreateChapter}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <FileText className="w-4 h-4" />
                新增章节
              </button>
              <button
                onClick={onCreateVolume}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <Layers className="w-4 h-4" />
                新增卷
              </button>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            onClick={() => onSelectChapter(chapter.id)}
            className={`px-4 py-3 cursor-pointer transition-colors ${
              selectedChapter === chapter.id
                ? "text-black dark:text-white"
                : "text-gray-500 dark:text-gray-100"
            }`}
          >
            <div className="flex justify-between gap-2">
              <div className="flex-1 min-w-0 flex justify-between">
                <h3
                  className={`text-sm font-medium truncate mb-1 flex  ${
                    selectedChapter === chapter.id
                      ? "text-black dark:text-white"
                      : "text-gray-500 dark:text-gray-100"
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {chapter.title}
                </h3>

                <div
                  className={`flex items-center gap-2 text-xs ${
                    selectedChapter === chapter.id
                      ? "text-black dark:text-white"
                      : "text-gray-500 dark:text-gray-100"
                  }`}
                >
                  <span>{chapter.wordCount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
