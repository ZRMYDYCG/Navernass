import { Plus, FileText, Layers, Edit2, Trash2, GripVertical } from "lucide-react";
import { useState, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  onReorderChapters?: (chapters: Chapter[]) => void;
  onRenameChapter?: (chapter: Chapter) => void;
  onDeleteChapter?: (chapter: Chapter) => void;
}

interface SortableChapterItemProps {
  chapter: Chapter;
  isSelected: boolean;
  onSelect: () => void;
  onRename?: (chapter: Chapter) => void;
  onDelete?: (chapter: Chapter) => void;
}

// 可排序的章节项组件
function SortableChapterItem({
  chapter,
  isSelected,
  onSelect,
  onRename,
  onDelete,
}: SortableChapterItemProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group px-4 py-3 cursor-pointer transition-colors ${
        isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
    >
      <div className="flex items-center gap-2">
        {/* 拖拽手柄 + Popover */}
        <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger asChild>
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[160px]"
              sideOffset={5}
              align="start"
            >
              {onRename && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(chapter);
                    setPopoverOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  重命名
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(chapter);
                    setPopoverOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* 章节信息 */}
        <div className="flex-1 min-w-0 flex items-center justify-between" onClick={onSelect}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400" />
            <h3
              className={`text-sm font-medium truncate ${
                isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {chapter.title}
            </h3>
          </div>

          <span
            className={`text-xs ${
              isSelected ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-500"
            }`}
          >
            {chapter.wordCount}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChaptersTab({
  chapters,
  selectedChapter,
  onSelectChapter,
  onCreateChapter,
  onCreateVolume,
  onReorderChapters,
  onRenameChapter,
  onDeleteChapter,
}: ChaptersTabProps) {
  const [items, setItems] = useState(chapters);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 同步外部 chapters 变化
  useEffect(() => {
    setItems(chapters);
  }, [chapters]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      onReorderChapters?.(newItems);
    }
  };

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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((chapter) => (
              <SortableChapterItem
                key={chapter.id}
                chapter={chapter}
                isSelected={selectedChapter === chapter.id}
                onSelect={() => onSelectChapter(chapter.id)}
                onRename={onRenameChapter}
                onDelete={onDeleteChapter}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
