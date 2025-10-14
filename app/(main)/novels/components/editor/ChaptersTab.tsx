import { Plus } from "lucide-react";

interface Chapter {
  id: number;
  title: string;
  wordCount: string;
  status: string;
}

interface ChaptersTabProps {
  chapters: Chapter[];
  selectedChapter: number | null;
  onSelectChapter: (id: number) => void;
}

export function ChaptersTab({ chapters, selectedChapter, onSelectChapter }: ChaptersTabProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">章节目录</h2>
        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
          <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            onClick={() => onSelectChapter(chapter.id)}
            className={`px-4 py-3 border-b border-gray-200 dark:border-gray-800 cursor-pointer transition-colors ${
              selectedChapter === chapter.id
                ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600 dark:border-l-blue-400"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-sm font-medium truncate mb-1 ${
                    selectedChapter === chapter.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {chapter.title}
                </h3>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    selectedChapter === chapter.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
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
