"use client";

import { MoreVertical, FolderPlus, FilePlus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import * as Popover from "@radix-ui/react-popover";
import { knowledgeBasesApi, knowledgeItemsApi, type KnowledgeBase } from "@/lib/api";
import { toast } from "sonner";
import {
  FolderTreeItem,
  KnowledgeBaseList,
  CreateKnowledgeBaseDialog,
  CreateKnowledgeItemDialog,
  buildTree,
  type KnowledgeItem,
} from "./components";

export default function Knowledge() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKBName, setNewKBName] = useState("");
  const [newKBDescription, setNewKBDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createItemDialogOpen, setCreateItemDialogOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<"folder" | "file">("file");
  const [newItemName, setNewItemName] = useState("");
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  // 加载知识库列表
  const loadKnowledgeBases = useCallback(async () => {
    try {
      setLoading(true);
      const data = await knowledgeBasesApi.getList();
      setKnowledgeBases(data || []);
    } catch (error) {
      console.error("加载知识库失败:", error);
      const message = error instanceof Error ? error.message : "加载知识库失败";
      toast.error(message);
      setKnowledgeBases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载知识库内容
  const loadKnowledgeItems = useCallback(async (knowledgeBaseId: string) => {
    try {
      setItemsLoading(true);
      const items = await knowledgeItemsApi.getTreeByKnowledgeBaseId(knowledgeBaseId);
      const tree = buildTree(items || []);
      setKnowledgeItems(tree);
    } catch (error) {
      console.error("加载知识库内容失败:", error);
      const message = error instanceof Error ? error.message : "加载知识库内容失败";
      toast.error(message);
      setKnowledgeItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKnowledgeBases();
  }, [loadKnowledgeBases]);

  useEffect(() => {
    if (selectedKnowledgeBase) {
      loadKnowledgeItems(selectedKnowledgeBase);
    } else {
      setKnowledgeItems([]);
    }
  }, [selectedKnowledgeBase, loadKnowledgeItems]);

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  // 创建知识库
  const handleCreateKnowledgeBase = async () => {
    if (!newKBName.trim()) {
      toast.error("请输入知识库名称");
      return;
    }

    try {
      setIsCreating(true);
      const newKB = await knowledgeBasesApi.create({
        name: newKBName.trim(),
        description: newKBDescription.trim() || undefined,
      });
      toast.success("知识库创建成功！");
      setCreateDialogOpen(false);
      setNewKBName("");
      setNewKBDescription("");

      // 重新加载知识库列表
      await loadKnowledgeBases();

      // 自动选中新创建的知识库
      setSelectedKnowledgeBase(newKB.id);
    } catch (error) {
      console.error("创建知识库失败:", error);
      const message = error instanceof Error ? error.message : "创建知识库失败";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  // 打开创建知识项对话框
  const handleOpenCreateItemDialog = (type: "folder" | "file") => {
    setNewItemType(type);
    setNewItemName("");
    setCreateItemDialogOpen(true);
  };

  // 创建知识项（文件夹或文件）
  const handleCreateKnowledgeItem = async () => {
    if (!selectedKnowledgeBase) {
      toast.error("请先选择知识库");
      return;
    }

    if (!newItemName.trim()) {
      toast.error(`请输入${newItemType === "folder" ? "文件夹" : "文件"}名称`);
      return;
    }

    try {
      setIsCreatingItem(true);
      await knowledgeItemsApi.create({
        knowledge_base_id: selectedKnowledgeBase,
        type: newItemType,
        name: newItemName.trim(),
        order_index: knowledgeItems.length,
        content: newItemType === "file" ? "" : undefined,
      });

      toast.success(`${newItemType === "folder" ? "文件夹" : "文件"}创建成功！`);
      setCreateItemDialogOpen(false);
      setNewItemName("");

      // 重新加载知识库内容
      await loadKnowledgeItems(selectedKnowledgeBase);
    } catch (error) {
      console.error("创建失败:", error);
      const message = error instanceof Error ? error.message : "创建失败";
      toast.error(message);
    } finally {
      setIsCreatingItem(false);
    }
  };

  return (
    <>
      <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors">
        {/* 知识库列表 */}
        <KnowledgeBaseList
          knowledgeBases={knowledgeBases}
          selectedKnowledgeBase={selectedKnowledgeBase}
          loading={loading}
          onSelectKnowledgeBase={setSelectedKnowledgeBase}
          onCreateKnowledgeBase={() => setCreateDialogOpen(true)}
        />

        {/* 可调整大小的区域 - 仅在选中知识库时使用 ResizablePanelGroup */}
        {selectedKnowledgeBase !== null ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* 知识库列表区域 - 可拖拽调整大小 */}
            <ResizablePanel defaultSize={15} minSize={15} maxSize={20}>
              <section className="h-screen border-r border-neutral-200 dark:border-gray-800 flex flex-col">
                <div className="flex flex-col h-full">
                  {/* 顶部操作栏 */}
                  <div className="h-[64px] px-4 flex items-center justify-between border-b border-neutral-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      内容
                    </h2>
                    <div className="flex items-center gap-2">
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[160px]"
                            sideOffset={5}
                            align="end"
                          >
                            <button
                              onClick={() => handleOpenCreateItemDialog("folder")}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                              <FolderPlus className="w-4 h-4" />
                              新增文件夹
                            </button>
                            <button
                              onClick={() => handleOpenCreateItemDialog("file")}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                              <FilePlus className="w-4 h-4" />
                              新增文件
                            </button>
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    </div>
                  </div>

                  {/* 知识库列表 - 文件夹树形式 */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                    <div className="py-2">
                      {itemsLoading ? (
                        <div className="p-4 text-center text-sm text-gray-500">加载中...</div>
                      ) : knowledgeItems.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">暂无内容</div>
                      ) : (
                        knowledgeItems.map((item) => (
                          <FolderTreeItem
                            key={item.id}
                            item={item}
                            selectedItem={selectedItem}
                            expandedFolders={expandedFolders}
                            onSelectItem={setSelectedItem}
                            onToggleFolder={toggleFolder}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </ResizablePanel>

            <ResizableHandle className="bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors" />

            {/* 内容区域 - 可拖拽调整大小 */}
            <ResizablePanel defaultSize={70} minSize={50}>
              <section className="h-screen w-full bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  {/* 空状态图标 */}
                  <div className="mb-6">
                    <svg
                      className="w-32 h-32 text-gray-300 dark:text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={0.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>

                  {/* 空状态文字 */}
                  {selectedItem === null ? (
                    <>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        选择一个文件查看内容
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        点击左侧文件开始编辑
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        文件内容将在这里显示
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        选中的文件内容编辑器
                      </p>
                    </>
                  )}
                </div>
              </section>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          /* 未选中知识库时的内容区域 - 不使用拖拽 */
          <section className="h-screen w-full bg-white dark:bg-gray-900 flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              {/* 空状态图标 */}
              <div className="mb-6">
                <svg
                  className="w-32 h-32 text-gray-300 dark:text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={0.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              {/* 空状态文字 */}
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                选择一个知识库开始
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">点击左侧知识库查看内容</p>
            </div>
          </section>
        )}
      </div>

      {/* 创建知识项对话框 */}
      <CreateKnowledgeItemDialog
        open={createItemDialogOpen}
        onOpenChange={setCreateItemDialogOpen}
        type={newItemType}
        name={newItemName}
        isCreating={isCreatingItem}
        onNameChange={setNewItemName}
        onCreate={handleCreateKnowledgeItem}
      />

      {/* 创建知识库对话框 */}
      <CreateKnowledgeBaseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        name={newKBName}
        description={newKBDescription}
        isCreating={isCreating}
        onNameChange={setNewKBName}
        onDescriptionChange={setNewKBDescription}
        onCreate={handleCreateKnowledgeBase}
      />
    </>
  );
}
