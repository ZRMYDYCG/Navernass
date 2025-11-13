'use client'

import type { ImperativePanelHandle } from 'react-resizable-panels'
import type { Chapter, Novel, Volume } from '@/lib/supabase/sdk'
import * as Tooltip from '@radix-ui/react-tooltip'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Kbd } from '@/components/ui/kbd'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Spinner } from '@/components/ui/spinner'
import { useIsMobile } from '@/hooks/use-media-query'
import { chaptersApi, novelsApi, volumesApi } from '@/lib/supabase/sdk'
import { CreateChapterDialog } from './_components/create-chapter-dialog'
import { CreateVolumeDialog } from './_components/create-volume-dialog'
import EditorContent from './_components/editor-content'
import EditorHeader from './_components/editor-header'
import LeftPanel from './_components/left-panel'
import RightPanel from './_components/right-panel'

export default function NovelsEdit() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const novelId = searchParams.get('id')

  const [novel, setNovel] = useState<Novel | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [volumes, setVolumes] = useState<Volume[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [openTabs, setOpenTabs] = useState<Array<{ id: string, title: string }>>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const [showLeftPanel, setShowLeftPanel] = useState(!isMobile)
  const [showRightPanel, setShowRightPanel] = useState(false)
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [createChapterDialogOpen, setCreateChapterDialogOpen] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [isCreatingChapter, setIsCreatingChapter] = useState(false)
  const [createVolumeDialogOpen, setCreateVolumeDialogOpen] = useState(false)
  const [newVolumeTitle, setNewVolumeTitle] = useState('')
  const [newVolumeDescription, setNewVolumeDescription] = useState('')
  const [isCreatingVolume, setIsCreatingVolume] = useState(false)

  // 面板控制引用
  const leftPanelRef = useRef<ImperativePanelHandle>(null)
  const rightPanelRef = useRef<ImperativePanelHandle>(null)

  // 切换面板的处理函数
  const handleToggleLeftPanel = useCallback(() => {
    if (isMobile) {
      setLeftDrawerOpen(true)
    } else {
      if (leftPanelRef.current) {
        if (leftPanelRef.current.isCollapsed()) {
          leftPanelRef.current.expand()
        } else {
          leftPanelRef.current.collapse()
        }
      }
    }
  }, [isMobile])

  const handleToggleRightPanel = useCallback(() => {
    if (isMobile) {
      setRightDrawerOpen(true)
    } else {
      if (rightPanelRef.current) {
        if (rightPanelRef.current.isCollapsed()) {
          rightPanelRef.current.expand()
        } else {
          rightPanelRef.current.collapse()
        }
      }
    }
  }, [isMobile])

  // 加载小说和章节数据
  useEffect(() => {
    if (!novelId) {
      toast.error('缺少小说ID')
      router.push('/novels')
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)
        const [novelData, chaptersData, volumesData] = await Promise.all([
          novelsApi.getById(novelId),
          chaptersApi.getByNovelId(novelId),
          volumesApi.getByNovelId(novelId),
        ])
        setNovel(novelData)
        setChapters(chaptersData)
        setVolumes(volumesData)
      } catch (error) {
        console.error('加载数据失败:', error)
        const message = error instanceof Error ? error.message : '加载数据失败'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [novelId, router])

  // 键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+E 切换左侧面板
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault()
        handleToggleLeftPanel()
      }
      // Ctrl+L 切换右侧面板
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault()
        handleToggleRightPanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleToggleLeftPanel, handleToggleRightPanel])

  // 处理章节选择
  const handleSelectChapter = (chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId)
    if (!chapter) return

    setSelectedChapter(chapterId)

    // 如果该章节不在已打开的标签页中，添加它
    if (!openTabs.find(tab => tab.id === chapterId)) {
      setOpenTabs([...openTabs, { id: chapter.id, title: chapter.title }])
    }

    // 设置为当前活动标签
    setActiveTab(chapterId)

    // 移动端选择章节后关闭左侧 Drawer
    if (isMobile) {
      setLeftDrawerOpen(false)
    }
  }

  const closeTab = (tabId: string) => {
    const newTabs = openTabs.filter(tab => tab.id !== tabId)
    setOpenTabs(newTabs)
    if (activeTab === tabId) {
      if (newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].id)
        setSelectedChapter(newTabs[newTabs.length - 1].id)
      } else {
        setActiveTab(null)
        setSelectedChapter(null)
      }
    }
  }

  // 打开创建章节对话框
  const handleOpenCreateChapterDialog = () => {
    setNewChapterTitle('')
    setCreateChapterDialogOpen(true)
  }

  // 创建新章节
  const handleCreateChapter = async () => {
    if (!novelId) return
    if (!newChapterTitle.trim()) {
      toast.error('请输入章节标题')
      return
    }

    try {
      setIsCreatingChapter(true)
      const newChapter = await chaptersApi.create({
        novel_id: novelId,
        title: newChapterTitle.trim(),
        order_index: chapters.length,
        content: '',
      })

      toast.success('章节创建成功！')
      setCreateChapterDialogOpen(false)

      // 重新加载章节列表
      const updatedChapters = await chaptersApi.getByNovelId(novelId)
      setChapters(updatedChapters)

      // 自动打开新创建的章节
      handleSelectChapter(newChapter.id)
    } catch (error) {
      console.error('创建章节失败:', error)
      const message = error instanceof Error ? error.message : '创建章节失败'
      toast.error(message)
    } finally {
      setIsCreatingChapter(false)
    }
  }

  // 打开创建卷对话框
  const handleOpenCreateVolumeDialog = () => {
    setNewVolumeTitle('')
    setNewVolumeDescription('')
    setCreateVolumeDialogOpen(true)
  }

  // 创建新卷
  const handleCreateVolume = async () => {
    if (!novelId) return
    if (!newVolumeTitle.trim()) {
      toast.error('请输入卷标题')
      return
    }

    try {
      setIsCreatingVolume(true)
      await volumesApi.create({
        novel_id: novelId,
        title: newVolumeTitle.trim(),
        description: newVolumeDescription.trim() || undefined,
        order_index: volumes.length,
      })

      toast.success('卷创建成功！')
      setCreateVolumeDialogOpen(false)

      // 重新加载卷列表
      const updatedVolumes = await volumesApi.getByNovelId(novelId)
      setVolumes(updatedVolumes)
    } catch (error) {
      console.error('创建卷失败:', error)
      const message = error instanceof Error ? error.message : '创建卷失败'
      toast.error(message)
    } finally {
      setIsCreatingVolume(false)
    }
  }

  // 处理章节排序
  const handleReorderChapters = async (reorderedChapters: Array<{ id: string, order_index: number }>) => {
    try {
      await chaptersApi.updateOrder(
        reorderedChapters.map((c, index) => ({
          id: c.id,
          order_index: index,
        })),
      )
      // 重新加载章节列表
      if (novelId) {
        const updatedChapters = await chaptersApi.getByNovelId(novelId)
        setChapters(updatedChapters)
      }
    } catch (error) {
      console.error('更新章节顺序失败:', error)
      toast.error('更新章节顺序失败')
    }
  }

  // 处理卷排序
  const handleReorderVolumes = async (reorderedVolumes: Array<{ id: string, order_index: number }>) => {
    try {
      await volumesApi.updateOrder(
        reorderedVolumes.map((v, index) => ({
          id: v.id,
          order_index: index,
        })),
      )
      toast.success('卷顺序已更新')
      // 重新加载卷列表以显示新顺序
      if (novelId) {
        const updatedVolumes = await volumesApi.getByNovelId(novelId)
        setVolumes(updatedVolumes)
      }
    } catch (error) {
      console.error('更新卷顺序失败:', error)
      toast.error('更新卷顺序失败')
      // 重新加载卷列表以恢复原状
      if (novelId) {
        const updatedVolumes = await volumesApi.getByNovelId(novelId)
        setVolumes(updatedVolumes)
      }
    }
  }

  // 处理章节移动到卷
  const handleMoveChapterToVolume = async (chapterId: string, volumeId: string | null) => {
    try {
      await chaptersApi.update({
        id: chapterId,
        volume_id: volumeId,
      })
      toast.success(volumeId ? '章节已移入卷' : '章节已移出卷')
      // 重新加载章节列表
      if (novelId) {
        const updatedChapters = await chaptersApi.getByNovelId(novelId)
        setChapters(updatedChapters)
      }
    } catch (error) {
      console.error('移动章节失败:', error)
      toast.error('移动章节失败')
    }
  }

  // 返回小说列表
  const handleBack = () => {
    router.push('/novels')
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 gap-3">
        <Spinner className="w-8 h-8" />
        <span className="text-sm text-gray-500 dark:text-gray-400">加载中...</span>
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">小说不存在</div>
      </div>
    )
  }

  // 格式化章节数据以适配组件
  const formattedChapters = chapters.map(chapter => ({
    id: chapter.id,
    title: chapter.title,
    wordCount: `${(chapter.word_count / 1000).toFixed(1)}k字`,
    status: chapter.status === 'published' ? '已发布' : '草稿',
    volume_id: chapter.volume_id,
  }))

  return (
    <Tooltip.Provider>
      <div className="h-screen flex flex-col overflow-hidden">
        <EditorHeader
          novelTitle={`《${novel.title}》`}
          showLeftPanel={showLeftPanel}
          showRightPanel={showRightPanel}
          onToggleLeftPanel={handleToggleLeftPanel}
          onToggleRightPanel={handleToggleRightPanel}
          onBack={handleBack}
        />

        {/* 主题内容区域 */}
        <main className="flex-1 bg-gray-100 dark:bg-gray-800 transition-colors overflow-hidden">
          {isMobile
            ? (
                // 移动端：编辑器全屏显示
                <div className="h-full">
                  {selectedChapter === null || activeTab === null
                    ? (
                        // 未选择章节时显示欢迎界面
                        <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900">
                          <div className="flex flex-col items-center gap-6 text-gray-400 dark:text-gray-600 px-4">
                            <Image
                              src="/assets/svg/logo-eye.svg"
                              width={120}
                              height={120}
                              alt="Logo"
                              className="opacity-40"
                            />
                            <p className="text-sm text-center">选择一个章节开始编辑</p>
                            <button
                              type="button"
                              onClick={() => setLeftDrawerOpen(true)}
                              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                            >
                              打开章节列表
                            </button>
                          </div>
                        </div>
                      )
                    : (
                        // 选择章节后显示编辑器
                        <EditorContent
                          openTabs={openTabs}
                          activeTab={activeTab}
                          onTabChange={setActiveTab}
                          onTabClose={closeTab}
                          novelTitle={novel.title}
                          chapterTitle={chapters.find(c => c.id === activeTab)?.title || ''}
                          chapterId={activeTab}
                        />
                      )}
                </div>
              )
            : (
                // 桌面端：使用 ResizablePanelGroup
                <ResizablePanelGroup
                  direction="horizontal"
                  className="h-full"
                  autoSaveId="editor-layout"
                >
                  {/* 左侧：带Tab的侧边栏 */}
                  <ResizablePanel
                    ref={leftPanelRef}
                    id="left-panel"
                    order={1}
                    defaultSize={20}
                    minSize={15}
                    maxSize={30}
                    collapsible={true}
                    collapsedSize={0}
                    onCollapse={() => setShowLeftPanel(false)}
                    onExpand={() => setShowLeftPanel(true)}
                  >
                    {showLeftPanel && (
                      <LeftPanel
                        chapters={formattedChapters}
                        volumes={volumes}
                        selectedChapter={selectedChapter}
                        onSelectChapter={handleSelectChapter}
                        onCreateChapter={handleOpenCreateChapterDialog}
                        onCreateVolume={handleOpenCreateVolumeDialog}
                        onReorderChapters={handleReorderChapters}
                        onReorderVolumes={handleReorderVolumes}
                        onMoveChapterToVolume={handleMoveChapterToVolume}
                      />
                    )}
                  </ResizablePanel>

                  <ResizableHandle withHandle className={!showLeftPanel ? 'hidden' : ''} />

                  {/* 中间：编辑器 */}
                  <ResizablePanel
                    id="editor-panel"
                    order={2}
                    defaultSize={60}
                    minSize={40}
                  >
                    {selectedChapter === null || activeTab === null
                      ? (
                          // 未选择章节时显示欢迎界面
                          <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900">
                            <div className="flex flex-col items-center gap-6 text-gray-400 dark:text-gray-600">
                              <Image
                                src="/assets/svg/logo-eye.svg"
                                width={120}
                                height={120}
                                alt="Logo"
                                className="opacity-40"
                              />
                              <p className="text-sm">选择一个章节开始编辑</p>
                              <span className="flex items-center gap-1">
                                <Kbd>Ctrl</Kbd>
                                <Kbd>+</Kbd>
                                <Kbd>S</Kbd>
                                <span>保存内容</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Kbd>Ctrl</Kbd>
                                <Kbd>+</Kbd>
                                <Kbd>E</Kbd>
                                <span>切换左侧面板</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Kbd>Ctrl</Kbd>
                                <Kbd>+</Kbd>
                                <Kbd>L</Kbd>
                                <span>切换右侧面板</span>
                              </span>
                            </div>
                          </div>
                        )
                      : (
                          // 选择章节后显示编辑器
                          <EditorContent
                            openTabs={openTabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            onTabClose={closeTab}
                            novelTitle={novel.title}
                            chapterTitle={chapters.find(c => c.id === activeTab)?.title || ''}
                            chapterId={activeTab}
                          />
                        )}
                  </ResizablePanel>

                  <ResizableHandle withHandle className={!showRightPanel ? 'hidden' : ''} />

                  {/* 右侧：AI助手 */}
                  <ResizablePanel
                    ref={rightPanelRef}
                    id="right-panel"
                    order={3}
                    defaultSize={20}
                    minSize={15}
                    maxSize={30}
                    collapsible={true}
                    collapsedSize={0}
                    onCollapse={() => setShowRightPanel(false)}
                    onExpand={() => setShowRightPanel(true)}
                  >
                    {showRightPanel && <RightPanel />}
                  </ResizablePanel>
                </ResizablePanelGroup>
              )}
        </main>

        {/* 移动端：左侧 Drawer */}
        {isMobile && (
          <Drawer open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen} direction="left">
            <DrawerContent className="h-full max-w-[85%] sm:max-w-sm">
              <div className="h-full overflow-hidden">
                <LeftPanel
                  chapters={formattedChapters}
                  volumes={volumes}
                  selectedChapter={selectedChapter}
                  onSelectChapter={handleSelectChapter}
                  onCreateChapter={handleOpenCreateChapterDialog}
                  onCreateVolume={handleOpenCreateVolumeDialog}
                  onReorderChapters={handleReorderChapters}
                  onReorderVolumes={handleReorderVolumes}
                  onMoveChapterToVolume={handleMoveChapterToVolume}
                />
              </div>
            </DrawerContent>
          </Drawer>
        )}

        {/* 移动端：右侧 Drawer */}
        {isMobile && (
          <Drawer open={rightDrawerOpen} onOpenChange={setRightDrawerOpen} direction="right">
            <DrawerContent className="h-full max-w-[85%] sm:max-w-sm">
              <div className="h-full overflow-hidden">
                <RightPanel />
              </div>
            </DrawerContent>
          </Drawer>
        )}

        {/* 创建章节对话框 */}
        <CreateChapterDialog
          open={createChapterDialogOpen}
          onOpenChange={setCreateChapterDialogOpen}
          title={newChapterTitle}
          onTitleChange={setNewChapterTitle}
          onConfirm={handleCreateChapter}
          isCreating={isCreatingChapter}
        />

        {/* 创建卷对话框 */}
        <CreateVolumeDialog
          open={createVolumeDialogOpen}
          onOpenChange={setCreateVolumeDialogOpen}
          title={newVolumeTitle}
          description={newVolumeDescription}
          onTitleChange={setNewVolumeTitle}
          onDescriptionChange={setNewVolumeDescription}
          onConfirm={handleCreateVolume}
          isCreating={isCreatingVolume}
        />
      </div>
    </Tooltip.Provider>
  )
}
