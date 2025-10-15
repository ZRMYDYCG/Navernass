import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  MoreHorizontal,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { KnowledgeItem } from "./buildTree";

interface FolderTreeItemProps {
  item: KnowledgeItem;
  level?: number;
  selectedItem: string | null;
  expandedFolders: Set<string>;
  onSelectItem: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onCreateItemInFolder?: (folderId: string) => void;
  onRenameItem?: (item: KnowledgeItem) => void;
  onDeleteItem?: (item: KnowledgeItem) => void;
}

export function FolderTreeItem({
  item,
  level = 0,
  selectedItem,
  expandedFolders,
  onSelectItem,
  onToggleFolder,
  onCreateItemInFolder,
  onRenameItem,
  onDeleteItem,
}: FolderTreeItemProps) {
  const isFolder = item.type === "folder";
  const isExpanded = expandedFolders.has(item.id);
  const isSelected = selectedItem === item.id;
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  return (
    <div>
      <div
        onClick={() => {
          if (isFolder) {
            onToggleFolder(item.id);
          }
          onSelectItem(item.id);
        }}
        className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
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

        {/* 更多操作按钮（文件夹和文件都显示） */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPosition({ x: rect.right, y: rect.bottom });
            setMenuOpen(true);
          }}
          className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
          title="更多操作"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 操作菜单（文件夹和文件通用） */}
      {menuOpen && menuPosition && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div
            className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[160px]"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            {/* 新增文件选项（仅文件夹显示） */}
            {isFolder && onCreateItemInFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateItemInFolder(item.id);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                新增文件
              </button>
            )}
            {/* 重命名选项（文件夹和文件都显示） */}
            {onRenameItem && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRenameItem(item);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                重命名
              </button>
            )}
            {/* 删除选项（文件夹和文件都显示） */}
            {onDeleteItem && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(item);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            )}
          </div>
        </>
      )}

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
              onCreateItemInFolder={onCreateItemInFolder}
              onRenameItem={onRenameItem}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
