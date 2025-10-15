import { Folder, FolderOpen, ChevronRight, ChevronDown, FileText } from "lucide-react";
import type { KnowledgeItem } from "./buildTree";

interface FolderTreeItemProps {
  item: KnowledgeItem;
  level?: number;
  selectedItem: string | null;
  expandedFolders: Set<string>;
  onSelectItem: (id: string) => void;
  onToggleFolder: (id: string) => void;
}

export function FolderTreeItem({
  item,
  level = 0,
  selectedItem,
  expandedFolders,
  onSelectItem,
  onToggleFolder,
}: FolderTreeItemProps) {
  const isFolder = item.type === "folder";
  const isExpanded = expandedFolders.has(item.id);
  const isSelected = selectedItem === item.id;

  return (
    <div>
      <div
        onClick={() => {
          if (isFolder) {
            onToggleFolder(item.id);
          }
          onSelectItem(item.id);
        }}
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
          isSelected
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {/* 展开/折叠图标 */}
        {isFolder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFolder(item.id);
            }}
            className="flex-shrink-0 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}

        {/* 文件夹/文件图标 */}
        <div className="flex-shrink-0">
          {isFolder ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            )
          ) : (
            <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          )}
        </div>

        {/* 名称 */}
        <span className="flex-1 text-sm truncate">{item.name}</span>

        {/* 更新时间（仅文件显示） */}
        {!isFolder && item.updatedAt && (
          <span className="text-xs text-gray-400 dark:text-gray-500">{item.updatedAt}</span>
        )}
      </div>

      {/* 子项 */}
      {isFolder && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              selectedItem={selectedItem}
              expandedFolders={expandedFolders}
              onSelectItem={onSelectItem}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
