import { Database, Plus, Ellipsis } from "lucide-react";
import type { KnowledgeBase } from "@/lib/api";

interface KnowledgeBaseListProps {
  knowledgeBases: KnowledgeBase[];
  selectedKnowledgeBase: string | null;
  loading: boolean;
  onSelectKnowledgeBase: (id: string) => void;
  onCreateKnowledgeBase: () => void;
}

export function KnowledgeBaseList({
  knowledgeBases,
  selectedKnowledgeBase,
  loading,
  onSelectKnowledgeBase,
  onCreateKnowledgeBase,
}: KnowledgeBaseListProps) {
  return (
    <section className="h-screen border-r border-neutral-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="w-[200px]">
        <div className="w-full h-[64px] flex justify-between px-4 items-center border-b border-neutral-200 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">个人知识库</span>
          <button
            onClick={onCreateKnowledgeBase}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        {/* 知识库列表 */}
        <ul className="flex flex-col p-2">
          {loading ? (
            <li className="p-4 text-center text-sm text-gray-500">加载中...</li>
          ) : knowledgeBases.length === 0 ? (
            <li className="p-4 text-center text-sm text-gray-500">暂无知识库</li>
          ) : (
            knowledgeBases.map((kb) => (
              <li
                key={kb.id}
                onClick={() => onSelectKnowledgeBase(kb.id)}
                className={`p-4 rounded-md cursor-pointer transition-all ${
                  selectedKnowledgeBase === kb.id
                    ? "bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">{kb.name}</span>
                  </div>

                  <Ellipsis className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
