"use client";

import { MoreVertical, FolderPlus, FilePlus, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import * as Popover from "@radix-ui/react-popover";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { knowledgeBasesApi, knowledgeItemsApi, type KnowledgeBase } from "@/lib/api";
import { toast } from "sonner";
import { TiptapEditor } from "@/components/tiptap";
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
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingItem, setRenamingItem] = useState<KnowledgeItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [currentFileContent, setCurrentFileContent] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [selectedItemData, setSelectedItemData] = useState<KnowledgeItem | null>(null);

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

  // 加载选中文件的内容
  useEffect(() => {
    const loadFileContent = async () => {
      if (!selectedItem) {
        setCurrentFileContent("");
        setSelectedItemData(null);
        return;
      }

      try {
        setLoadingContent(true);
        const item = await knowledgeItemsApi.getById(selectedItem);
        setSelectedItemData(item);

        if (item.type === "file") {
          setCurrentFileContent(item.content || "");
        } else {
          setCurrentFileContent("");
        }
      } catch (error) {
        console.error("加载文件内容失败:", error);
        toast.error("加载文件内容失败");
        setCurrentFileContent("");
        setSelectedItemData(null);
      } finally {
        setLoadingContent(false);
      }
    };

    loadFileContent();
  }, [selectedItem]);

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
  const handleOpenCreateItemDialog = (type: "folder" | "file", folderId?: string) => {
    setNewItemType(type);
    setNewItemName("");
    setParentFolderId(folderId || null);
    setCreateItemDialogOpen(true);
  };

  // 在文件夹下创建文件
  const handleCreateItemInFolder = (folderId: string) => {
    handleOpenCreateItemDialog("file", folderId);
  };

  // 重命名知识项
  const handleRenameItem = (item: KnowledgeItem) => {
    setRenamingItem(item);
    setRenameValue(item.name);
    setRenameDialogOpen(true);
  };

  // 执行重命名
  const handleConfirmRename = async () => {
    if (!renamingItem || !selectedKnowledgeBase) return;
    if (!renameValue.trim()) {
      toast.error("请输入名称");
      return;
    }

    try {
      setIsRenaming(true);
      await knowledgeItemsApi.update({
        id: renamingItem.id,
        name: renameValue.trim(),
      });
      toast.success("重命名成功！");
      setRenameDialogOpen(false);
      setRenamingItem(null);
      setRenameValue("");
      await loadKnowledgeItems(selectedKnowledgeBase);
    } catch (error) {
      console.error("重命名失败:", error);
      const message = error instanceof Error ? error.message : "重命名失败";
      toast.error(message);
    } finally {
      setIsRenaming(false);
    }
  };

  // 删除知识项
  const handleDeleteItem = async (item: KnowledgeItem) => {
    if (!selectedKnowledgeBase) return;
    if (
      !confirm(
        `确定要删除"${item.name}"吗？${item.type === "folder" ? "文件夹内的所有内容也会被删除。" : ""}`
      )
    ) {
      return;
    }

    try {
      await knowledgeItemsApi.delete(item.id);
      toast.success("删除成功！");
      // 如果删除的是当前选中的项，清空选中
      if (item.id === selectedItem) {
        setSelectedItem(null);
      }
      await loadKnowledgeItems(selectedKnowledgeBase);
    } catch (error) {
      console.error("删除失败:", error);
      const message = error instanceof Error ? error.message : "删除失败";
      toast.error(message);
    }
  };

  // 保存文件内容
  const handleSaveContent = async (content: string) => {
    if (!selectedItem || !selectedItemData || selectedItemData.type !== "file") return;

    try {
      await knowledgeItemsApi.update({
        id: selectedItem,
        content,
      });
      // 不显示保存成功提示，因为是自动保存
    } catch (error) {
      console.error("保存失败:", error);
      toast.error("保存失败");
    }
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
        parent_id: parentFolderId || undefined,
        order_index: knowledgeItems.length,
        content: newItemType === "file" ? "" : undefined,
      });

      toast.success(`${newItemType === "folder" ? "文件夹" : "文件"}创建成功！`);
      setCreateItemDialogOpen(false);
      setNewItemName("");
      setParentFolderId(null);

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
                            onCreateItemInFolder={handleCreateItemInFolder}
                            onRenameItem={handleRenameItem}
                            onDeleteItem={handleDeleteItem}
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
              <section className="h-screen w-full bg-white dark:bg-gray-900">
                {loadingContent ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500 dark:text-gray-400">加载中...</div>
                  </div>
                ) : selectedItem && selectedItemData?.type === "file" ? (
                  <div className="h-full flex flex-col">
                    {/* 文件标题 */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {selectedItemData.name}
                      </h2>
                      <button
                        title="关闭"
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setSelectedItem(null)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {/* 编辑器 */}
                    <div className="flex-1 overflow-y-auto">
                      <TiptapEditor
                        key={selectedItem}
                        content={currentFileContent}
                        placeholder="开始编辑..."
                        onUpdate={handleSaveContent}
                        autoSave={true}
                        autoSaveDelay={2000}
                        className="h-full px-6 py-4"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
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
                      ) : selectedItemData?.type === "folder" ? (
                        <>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            这是一个文件夹
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            请选择文件夹内的文件进行编辑
                          </p>
                        </>
                      ) : null}
                    </div>
                  </div>
                )}
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

      {/* 重命名对话框 */}
      <Dialog.Root open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                重命名
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    placeholder="请输入名称"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Dialog.Close asChild>
                  <Button
                    type="button"
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                    disabled={isRenaming}
                  >
                    取消
                  </Button>
                </Dialog.Close>
                <Button
                  onClick={handleConfirmRename}
                  className="flex-1 bg-black dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                  disabled={isRenaming || !renameValue.trim()}
                >
                  {isRenaming ? "保存中..." : "保存"}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
