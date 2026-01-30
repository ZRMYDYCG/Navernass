'use client'

import type { ImperativePanelHandle } from 'react-resizable-panels'
import type { LeftTabType } from './_components/left-panel/types'
import type { Chapter, Novel, NovelCharacter, Volume } from '@/lib/supabase/sdk'
import * as Tooltip from '@radix-ui/react-tooltip'
import { ChevronUp } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Spinner } from '@/components/ui/spinner'
import { useIsMobile } from '@/hooks/use-media-query'
import { chaptersApi, charactersApi, novelsApi, relationshipsApi, volumesApi } from '@/lib/supabase/sdk'
import { useCharacterGraphStore } from '@/store/characterGraphStore'
import { useCharacterMaterialStore } from '@/store/characterMaterialStore'
import { ChapterQuickSearchDialog } from './_components/chapter-quick-search-dialog'
import { CharacterPanel } from './_components/character-panel'
import { CreateChapterDialog } from './_components/create-chapter-dialog'
import { CreateVolumeDialog } from './_components/create-volume-dialog'
import { DeleteConfirmDialog } from './_components/delete-confirm-dialog'
import EditorContent from './_components/editor-content'
import EditorHeader from './_components/editor-header'
import { EditorWelcome } from './_components/editor-welcome'
import { ImmersiveRegion } from './_components/immersive-region'
import LeftPanel from './_components/left-panel'
import { LockScreen } from './_components/lock-screen'
import { MoveChapterDialog } from './_components/move-chapter-dialog'
import { RenameChapterDialog } from './_components/rename-chapter-dialog'
import { RenameVolumeDialog } from './_components/rename-volume-dialog'
import RightPanel from './_components/right-panel'

function NovelsEditContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const novelId = searchParams.get('id')

  const [novel, setNovel] = useState<Novel | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [volumes, setVolumes] = useState<Volume[]>([])
  const [characters, setCharacters] = useState<NovelCharacter[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [openTabs, setOpenTabs] = useState<Array<{ id: string, title: string }>>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const prevIsMobileRef = useRef(isMobile)
  const desktopLeftStateRef = useRef<boolean | null>(null)
  const desktopRightStateRef = useRef<boolean | null>(null)
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [createChapterDialogOpen, setCreateChapterDialogOpen] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [newChapterVolumeId, setNewChapterVolumeId] = useState<string>('')
  const [isCreatingChapter, setIsCreatingChapter] = useState(false)
  const [createVolumeDialogOpen, setCreateVolumeDialogOpen] = useState(false)
  const [newVolumeTitle, setNewVolumeTitle] = useState('')
  const [newVolumeDescription, setNewVolumeDescription] = useState('')
  const [isCreatingVolume, setIsCreatingVolume] = useState(false)
  const [renameChapterDialogOpen, setRenameChapterDialogOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [editingChapterTitle, setEditingChapterTitle] = useState('')
  const [isUpdatingChapter, setIsUpdatingChapter] = useState(false)
  const [renameVolumeDialogOpen, setRenameVolumeDialogOpen] = useState(false)
  const [editingVolume, setEditingVolume] = useState<Volume | null>(null)
  const [editingVolumeTitle, setEditingVolumeTitle] = useState('')
  const [isUpdatingVolume, setIsUpdatingVolume] = useState(false)
  /* eslint-disable unused-imports/no-unused-vars */
  const [isLocked, setIsLocked] = useState(false)
  const [deleteChapterDialogOpen, setDeleteChapterDialogOpen] = useState(false)
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null)
  const [isDeletingChapter, setIsDeletingChapter] = useState(false)
  const [deleteVolumeDialogOpen, setDeleteVolumeDialogOpen] = useState(false)
  const [volumeToDelete, setVolumeToDelete] = useState<Volume | null>(null)
  const [isDeletingVolume, setIsDeletingVolume] = useState(false)
  const [quickSearchOpen, setQuickSearchOpen] = useState(false)
  const [moveChapterDialogOpen, setMoveChapterDialogOpen] = useState(false)
  const [chapterToMove, setChapterToMove] = useState<Chapter | null>(null)
  const [isMovingChapter, setIsMovingChapter] = useState(false)
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [showRightPanel, setShowRightPanel] = useState(false)
  const [isImmersiveMode, setIsImmersiveMode] = useState(false)
  const [activeLeftTab, setActiveLeftTab] = useState<LeftTabType | 'characters'>('files')
  const [characterPanelOpen, setCharacterPanelOpen] = useState(false)
  const [characterPanelClosing, setCharacterPanelClosing] = useState(false)
  const immersiveActive = isImmersiveMode && !isMobile

  useEffect(() => {
    const prev = prevIsMobileRef.current

    if (isMobile && !prev) {
      desktopLeftStateRef.current = showLeftPanel
      desktopRightStateRef.current = showRightPanel
      setShowLeftPanel(false)
      setShowRightPanel(false)
    } else if (!isMobile && prev) {
      setShowLeftPanel(desktopLeftStateRef.current ?? true)
      setShowRightPanel(desktopRightStateRef.current ?? false)
      desktopLeftStateRef.current = null
      desktopRightStateRef.current = null
    }

    prevIsMobileRef.current = isMobile
  }, [isMobile, showLeftPanel, showRightPanel])

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

  const handleToggleImmersiveMode = useCallback(() => {
    setIsImmersiveMode(prev => !prev)
  }, [])

  const handleImageGenerated = (imageUrl: string) => {
    const editorEvent = new CustomEvent('novel-insert-image-to-editor', {
      detail: { imageUrl, chapterId: selectedChapter },
    })
    window.dispatchEvent(editorEvent)
  }

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
  const loadData = useCallback(async () => {
    if (!novelId) {
      toast.error('缺少小说ID')
      router.push('/novels')
      return
    }

    try {
      setLoading(true)
      const [novelData, chaptersData, volumesData, charactersData, relationshipsData] = await Promise.all([
        novelsApi.getById(novelId),
        chaptersApi.getByNovelId(novelId),
        volumesApi.getByNovelId(novelId),
        charactersApi.getByNovelId(novelId),
        relationshipsApi.getByNovelId(novelId),
      ])
      setNovel(novelData)
      setChapters(chaptersData)
      setVolumes(volumesData)
      setCharacters(charactersData)

      // 存入角色素材 store
      useCharacterMaterialStore.getState().setCharacters(charactersData)
      // 存入关系图 store，保证刷新后连线存在
      useCharacterGraphStore.getState().setRelationships(novelId, relationshipsData)
    } catch (error) {
      console.error('加载数据失败:', error)
      const message = error instanceof Error ? error.message : '加载数据失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [novelId, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!novelId) return

    let cancelled = false

    const handleCharactersChanged: EventListener = (event) => {
      const customEvent = event as CustomEvent<{ novelId: string }>
      if (customEvent.detail?.novelId !== novelId) return

      void (async () => {
        try {
          const charactersData = await charactersApi.getByNovelId(novelId)
          if (!cancelled) {
            setCharacters(charactersData)
            useCharacterMaterialStore.getState().setCharacters(charactersData)
          }
        } catch (error) {
          if (!cancelled) {
            console.error(error)
          }
        }
      })()
    }

    window.addEventListener('novel-characters-changed', handleCharactersChanged)

    return () => {
      cancelled = true
      window.removeEventListener('novel-characters-changed', handleCharactersChanged)
    }
  }, [novelId])

  // 处理章节导入后的刷新
  const handleChaptersImported = useCallback(() => {
    loadData()
  }, [loadData])

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
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault()
        handleToggleImmersiveMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleToggleLeftPanel, handleToggleRightPanel, handleToggleImmersiveMode])

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

  // 关闭其他标签页
  const closeOtherTabs = (tabId: string) => {
    const tabToKeep = openTabs.find(tab => tab.id === tabId)
    if (!tabToKeep) return

    setOpenTabs([tabToKeep])
    setActiveTab(tabId)
    setSelectedChapter(tabId)
  }

  // 关闭所有标签页
  const closeAllTabs = () => {
    setOpenTabs([])
    setActiveTab(null)
    setSelectedChapter(null)
  }

  // 关闭左侧标签页
  const closeLeftTabs = (tabId: string) => {
    const currentIndex = openTabs.findIndex(tab => tab.id === tabId)
    if (currentIndex <= 0) return // 没有左侧标签页

    const newTabs = openTabs.slice(currentIndex)
    setOpenTabs(newTabs)
    if (activeTab !== tabId) {
      setActiveTab(tabId)
      setSelectedChapter(tabId)
    }
  }

  // 关闭右侧标签页
  const closeRightTabs = (tabId: string) => {
    const currentIndex = openTabs.findIndex(tab => tab.id === tabId)
    if (currentIndex < 0 || currentIndex === openTabs.length - 1) return // 没有右侧标签页

    const newTabs = openTabs.slice(0, currentIndex + 1)
    setOpenTabs(newTabs)
    // 如果当前激活的标签页在右侧，需要切换到当前标签页
    if (activeTab !== tabId && !newTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(tabId)
      setSelectedChapter(tabId)
    }
  }

  // 打开创建章节对话框
  const handleOpenCreateChapterDialog = () => {
    setNewChapterTitle('')
    setNewChapterVolumeId('')
    setCreateChapterDialogOpen(true)
  }

  // 在卷中创建章节
  const handleCreateChapterInVolume = async (volumeId: string) => {
    if (!novelId) return

    try {
      setIsCreatingChapter(true)

      // 找到该卷下的所有章节，确定新章节的 order_index
      const volumeChapters = chapters
        .filter(c => c.volume_id === volumeId)
        .sort((a, b) => a.order_index - b.order_index)

      // 新章节的 order_index 应该是卷中最后一个章节的 order_index + 1
      // 如果卷中没有章节，则使用卷的 order_index * 1000 作为起始值
      const volume = volumes.find(v => v.id === volumeId)
      const newOrderIndex = volumeChapters.length > 0
        ? volumeChapters[volumeChapters.length - 1].order_index + 1
        : (volume?.order_index ?? 0) * 1000

      const newChapter = await chaptersApi.create({
        novel_id: novelId,
        title: '新章节',
        order_index: newOrderIndex,
        content: '',
        volume_id: volumeId,
      })

      toast.success('章节创建成功！')

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

  // 复制章节
  const handleCopyChapter = async (chapter: { id: string }) => {
    if (!novelId) return

    try {
      setIsCreatingChapter(true)
      const originalChapter = await chaptersApi.getById(chapter.id)
      if (!originalChapter) {
        toast.error('无法获取原章节信息')
        return
      }

      // 调试：检查原章节的 volume_id
      // eslint-disable-next-line no-console
      console.log('原章节信息:', {
        id: originalChapter.id,
        title: originalChapter.title,
        volume_id: originalChapter.volume_id,
        volume_id_type: typeof originalChapter.volume_id,
      })

      // 确定新章节的 order_index
      // 副本应该插入到原章节的紧后面，并且保持在同一个卷中
      let newOrderIndex: number
      let chaptersToUpdate: Array<{ id: string, order_index: number }> = []

      // 明确检查 volume_id 是否存在（不为 null、undefined 或空字符串）
      const hasVolumeId = originalChapter.volume_id != null && originalChapter.volume_id !== ''

      if (hasVolumeId) {
        // 如果原章节在卷中，副本也应该在同一个卷中
        const volumeId = originalChapter.volume_id!
        const volumeChapters = chapters
          .filter(c => c.volume_id === volumeId)
          .sort((a, b) => a.order_index - b.order_index)

        const currentIndex = volumeChapters.findIndex(c => c.id === originalChapter.id)
        if (currentIndex >= 0) {
          // 新章节插入到原章节之后
          newOrderIndex = originalChapter.order_index + 1

          // 更新原章节之后所有章节的 order_index（+1）
          if (currentIndex < volumeChapters.length - 1) {
            chaptersToUpdate = volumeChapters.slice(currentIndex + 1).map((c, idx) => ({
              id: c.id,
              order_index: newOrderIndex + 1 + idx,
            }))
          }
        } else {
          // 如果找不到，则放在卷的最后
          const lastChapter = volumeChapters[volumeChapters.length - 1]
          newOrderIndex = lastChapter ? lastChapter.order_index + 1 : originalChapter.order_index + 1
        }
      } else {
        // 如果原章节在根目录，副本也在根目录
        const rootChapters = chapters
          .filter(c => !c.volume_id)
          .sort((a, b) => a.order_index - b.order_index)

        const currentIndex = rootChapters.findIndex(c => c.id === originalChapter.id)
        if (currentIndex >= 0) {
          // 新章节插入到原章节之后
          newOrderIndex = originalChapter.order_index + 1

          // 更新原章节之后所有章节的 order_index（+1）
          if (currentIndex < rootChapters.length - 1) {
            chaptersToUpdate = rootChapters.slice(currentIndex + 1).map((c, idx) => ({
              id: c.id,
              order_index: newOrderIndex + 1 + idx,
            }))
          }
        } else {
          // 如果找不到，则放在根目录的最后
          const lastChapter = rootChapters[rootChapters.length - 1]
          newOrderIndex = lastChapter ? lastChapter.order_index + 1 : originalChapter.order_index + 1
        }
      }

      // 先更新后面章节的 order_index
      if (chaptersToUpdate.length > 0) {
        await chaptersApi.updateOrder(chaptersToUpdate)
      }

      // 创建复制的章节，保持在同一个卷中
      // 明确保留原章节的 volume_id
      const newChapterVolumeId = hasVolumeId ? originalChapter.volume_id! : undefined

      // eslint-disable-next-line no-console
      console.log('创建副本章节，volume_id:', newChapterVolumeId)

      const newChapter = await chaptersApi.create({
        novel_id: novelId,
        title: `${originalChapter.title} (副本)`,
        order_index: newOrderIndex,
        content: originalChapter.content || '',
        volume_id: newChapterVolumeId,
      })

      toast.success('章节复制成功！')

      // 重新加载章节列表
      const updatedChapters = await chaptersApi.getByNovelId(novelId)
      setChapters(updatedChapters)

      // 自动打开新复制的章节
      handleSelectChapter(newChapter.id)
    } catch (error) {
      console.error('复制章节失败:', error)
      const message = error instanceof Error ? error.message : '复制章节失败'
      toast.error(message)
    } finally {
      setIsCreatingChapter(false)
    }
  }

  // 创建新章节
  const handleCreateChapter = async (volumeId?: string) => {
    if (!novelId) return
    if (!newChapterTitle.trim()) {
      toast.error('请输入章节标题')
      return
    }

    try {
      setIsCreatingChapter(true)

      let newOrderIndex: number
      if (volumeId) {
        const volumeChapters = chapters
          .filter(c => c.volume_id === volumeId)
          .sort((a, b) => a.order_index - b.order_index)
        const volume = volumes.find(v => v.id === volumeId)
        newOrderIndex = volumeChapters.length > 0
          ? volumeChapters[volumeChapters.length - 1].order_index + 1
          : (volume?.order_index ?? 0) * 1000
      } else {
        const rootChapters = chapters
          .filter(c => !c.volume_id)
          .sort((a, b) => a.order_index - b.order_index)
        newOrderIndex = rootChapters.length > 0
          ? rootChapters[rootChapters.length - 1].order_index + 1
          : chapters.length
      }

      const newChapter = await chaptersApi.create({
        novel_id: novelId,
        title: newChapterTitle.trim(),
        order_index: newOrderIndex,
        content: '',
        volume_id: volumeId || undefined,
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

  // 重命名章节
  const handleRenameChapter = (chapter: { id: string, title: string }) => {
    const fullChapter = chapters.find(c => c.id === chapter.id)
    if (!fullChapter) return
    setEditingChapter(fullChapter)
    setEditingChapterTitle(fullChapter.title)
    setRenameChapterDialogOpen(true)
  }

  const handleConfirmRenameChapter = async () => {
    if (!editingChapter || !editingChapterTitle.trim()) return

    try {
      setIsUpdatingChapter(true)
      await chaptersApi.update({
        id: editingChapter.id,
        title: editingChapterTitle.trim(),
      })
      toast.success('章节重命名成功！')
      setRenameChapterDialogOpen(false)

      // 重新加载章节列表
      if (novelId) {
        const updatedChapters = await chaptersApi.getByNovelId(novelId)
        setChapters(updatedChapters)
      }
    } catch (error) {
      console.error('重命名章节失败:', error)
      const message = error instanceof Error ? error.message : '重命名章节失败'
      toast.error(message)
    } finally {
      setIsUpdatingChapter(false)
    }
  }

  // 删除章节
  const handleDeleteChapter = (chapter: { id: string, title: string }) => {
    const fullChapter = chapters.find(c => c.id === chapter.id)
    if (!fullChapter) return

    setChapterToDelete(fullChapter)
    setDeleteChapterDialogOpen(true)
  }

  const handleMoveChapter = (chapter: { id: string, title: string }) => {
    const fullChapter = chapters.find(c => c.id === chapter.id)
    if (!fullChapter) return

    setChapterToMove(fullChapter)
    setMoveChapterDialogOpen(true)
  }

  const handleConfirmDeleteChapter = async () => {
    if (!chapterToDelete || !novelId) return

    try {
      setIsDeletingChapter(true)
      await chaptersApi.delete(chapterToDelete.id)
      toast.success('章节删除成功！')

      // 如果删除的是当前打开的章节，关闭它
      if (activeTab === chapterToDelete.id) {
        const newTabs = openTabs.filter(tab => tab.id !== chapterToDelete.id)
        setOpenTabs(newTabs)
        if (newTabs.length > 0) {
          setActiveTab(newTabs[newTabs.length - 1].id)
          setSelectedChapter(newTabs[newTabs.length - 1].id)
        } else {
          setActiveTab(null)
          setSelectedChapter(null)
        }
      }

      // 重新加载章节列表
      const updatedChapters = await chaptersApi.getByNovelId(novelId)
      setChapters(updatedChapters)

      setDeleteChapterDialogOpen(false)
      setChapterToDelete(null)
    } catch (error) {
      console.error('删除章节失败:', error)
      const message = error instanceof Error ? error.message : '删除章节失败'
      toast.error(message)
    } finally {
      setIsDeletingChapter(false)
    }
  }

  const handleConfirmMoveChapter = async (volumeId: string | null) => {
    if (!chapterToMove || !novelId) return

    try {
      setIsMovingChapter(true)
      await chaptersApi.update({
        id: chapterToMove.id,
        volume_id: volumeId,
      })
      toast.success(volumeId ? '章节已移入卷' : '章节已移出到根目录')

      // 重新加载章节列表
      const updatedChapters = await chaptersApi.getByNovelId(novelId)
      setChapters(updatedChapters)

      setMoveChapterDialogOpen(false)
      setChapterToMove(null)
    } catch (error) {
      console.error('移动章节失败:', error)
      const message = error instanceof Error ? error.message : '移动章节失败'
      toast.error(message)
    } finally {
      setIsMovingChapter(false)
    }
  }

  // 重命名卷
  const handleRenameVolume = (volume: { id: string, title: string }) => {
    const fullVolume = volumes.find(v => v.id === volume.id)
    if (!fullVolume) return
    setEditingVolume(fullVolume)
    setEditingVolumeTitle(fullVolume.title)
    setRenameVolumeDialogOpen(true)
  }

  const handleConfirmRenameVolume = async () => {
    if (!editingVolume || !editingVolumeTitle.trim()) return

    try {
      setIsUpdatingVolume(true)
      await volumesApi.update({
        id: editingVolume.id,
        title: editingVolumeTitle.trim(),
      })
      toast.success('卷重命名成功！')
      setRenameVolumeDialogOpen(false)

      // 重新加载卷列表
      if (novelId) {
        const updatedVolumes = await volumesApi.getByNovelId(novelId)
        setVolumes(updatedVolumes)
      }
    } catch (error) {
      console.error('重命名卷失败:', error)
      const message = error instanceof Error ? error.message : '重命名卷失败'
      toast.error(message)
    } finally {
      setIsUpdatingVolume(false)
    }
  }

  // 删除卷
  const handleDeleteVolume = (volume: { id: string, title: string }) => {
    const fullVolume = volumes.find(v => v.id === volume.id)
    if (!fullVolume) return

    setVolumeToDelete(fullVolume)
    setDeleteVolumeDialogOpen(true)
  }

  const handleConfirmDeleteVolume = async () => {
    if (!volumeToDelete || !novelId) return

    try {
      setIsDeletingVolume(true)

      // 先获取卷下的章节
      const volumeChapters = chapters.filter(c => c.volume_id === volumeToDelete.id)

      // 将卷下的章节移出卷
      for (const chapter of volumeChapters) {
        await chaptersApi.update({
          id: chapter.id,
          volume_id: null,
        })
      }

      // 删除卷
      await volumesApi.delete(volumeToDelete.id)
      toast.success('卷删除成功！')

      // 重新加载数据
      const [updatedChapters, updatedVolumes] = await Promise.all([
        chaptersApi.getByNovelId(novelId),
        volumesApi.getByNovelId(novelId),
      ])
      setChapters(updatedChapters)
      setVolumes(updatedVolumes)

      setDeleteVolumeDialogOpen(false)
      setVolumeToDelete(null)
    } catch (error) {
      console.error('删除卷失败:', error)
      const message = error instanceof Error ? error.message : '删除卷失败'
      toast.error(message)
    } finally {
      setIsDeletingVolume(false)
    }
  }

  // 锁屏处理
  const handleLock = async () => {
    const { setLocked } = await import('./_components/lock-screen/utils')
    setLocked(true)
    setIsLocked(true)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('lockScreenChange'))
    }
  }

  // 锁屏状态变化回调
  const handleLockChange = (locked: boolean) => {
    setIsLocked(locked)
  }

  // 返回小说列表
  const handleBack = () => {
    router.push('/novels')
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-3">
        <Spinner className="w-8 h-8" />
        <span className="text-sm text-muted-foreground">加载中...</span>
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">小说不存在</div>
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
    updated_at: chapter.updated_at, // 保留原始数据用于工作区
  }))

  return (
    <Tooltip.Provider>
      <LockScreen onLockChange={handleLockChange}>
        <div className="h-screen flex flex-col overflow-hidden">
          <ImmersiveRegion isImmersive={immersiveActive}>
            <EditorHeader
              title={activeTab ? chapters.find(c => c.id === activeTab)?.title || '未选择章节' : '未选择章节'}
              currentChapterId={activeTab}
              isImmersiveMode={isImmersiveMode}
              showLeftPanel={showLeftPanel}
              onToggleLeftPanel={handleToggleLeftPanel}
              onSelectChapter={handleSelectChapter}
              onToggleAI={() => {
                handleToggleRightPanel()
              }}
              onLock={handleLock}
              onToggleImmersiveMode={handleToggleImmersiveMode}
              onBack={handleBack}
              novelId={novelId || undefined}
              chapterIds={chapters.map(c => c.id)}
              onOpenChapterSearch={() => setQuickSearchOpen(true)}
              onToggleCharacters={() => setCharacterPanelOpen(true)}
            />
          </ImmersiveRegion>

          {/* 内容区域 */}
          <main className="flex-1 flex flex-col bg-muted transition-colors overflow-hidden">
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full"
              autoSaveId="editor-layout"
            >
              {/* 左侧：Tab 侧边栏 */}
              <ResizablePanel
                ref={leftPanelRef}
                id="left-panel"
                order={1}
                defaultSize={20}
                minSize={0}
                maxSize={30}
                collapsible={true}
                collapsedSize={0}
                onCollapse={() => setShowLeftPanel(false)}
                onExpand={() => setShowLeftPanel(true)}
                style={isMobile && !showLeftPanel ? { display: 'none' } : undefined}
              >
                <ImmersiveRegion isImmersive={immersiveActive} className="h-full">
                  <LeftPanel
                    novelTitle={novel.title}
                    novelId={novelId!}
                    chapters={formattedChapters}
                    volumes={volumes}
                    selectedChapter={selectedChapter}
                    activeTab={activeLeftTab as LeftTabType}
                    onTabChange={setActiveLeftTab as (tab: LeftTabType) => void}
                    onSelectChapter={handleSelectChapter}
                    onCreateChapter={handleOpenCreateChapterDialog}
                    onCreateChapterInVolume={handleCreateChapterInVolume}
                    onCreateVolume={handleOpenCreateVolumeDialog}
                    onReorderChapters={handleReorderChapters}
                    onReorderVolumes={handleReorderVolumes}
                    onMoveChapterToVolume={handleMoveChapterToVolume}
                    onRenameChapter={handleRenameChapter}
                    onDeleteChapter={handleDeleteChapter}
                    onCopyChapter={handleCopyChapter}
                    onMoveChapter={handleMoveChapter}
                    onRenameVolume={handleRenameVolume}
                    onDeleteVolume={handleDeleteVolume}
                    onChaptersImported={handleChaptersImported}
                    onImageGenerated={handleImageGenerated}
                  />
                </ImmersiveRegion>
              </ResizablePanel>

              <ResizableHandle withHandle className={!showLeftPanel ? 'hidden' : ''} />

              {/* 中间：编辑器 */}
              <ResizablePanel
                id="editor-panel"
                order={2}
                defaultSize={activeLeftTab === 'characters' ? 80 : 60}
                minSize={activeLeftTab === 'characters' ? 80 : 40}
              >
                {activeLeftTab === 'characters'
                  ? (
                      <CharacterPanel novelId={novelId!} novelTitle={novel?.title} />
                    )
                  : selectedChapter === null || activeTab === null
                    ? (
                        <EditorWelcome />
                      )
                    : (
                        <EditorContent
                          openTabs={openTabs}
                          activeTab={activeTab}
                          onTabChange={setActiveTab}
                          onTabClose={closeTab}
                          onTabCloseOthers={closeOtherTabs}
                          onTabCloseAll={closeAllTabs}
                          onTabCloseLeft={closeLeftTabs}
                          onTabCloseRight={closeRightTabs}
                          novelTitle={novel.title}
                          chapterTitle={chapters.find(c => c.id === activeTab)?.title || ''}
                          chapterId={activeTab}
                          volumes={volumes}
                          chapters={chapters}
                          characters={characters}
                          onSelectChapter={handleSelectChapter}
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
                minSize={0}
                maxSize={30}
                collapsible={true}
                collapsedSize={0}
                onCollapse={() => setShowRightPanel(false)}
                onExpand={() => setShowRightPanel(true)}
                style={isMobile && !showRightPanel ? { display: 'none' } : undefined}
              >
                <ImmersiveRegion isImmersive={immersiveActive} className="h-full">
                  <RightPanel />
                </ImmersiveRegion>
              </ResizablePanel>
            </ResizablePanelGroup>
          </main>

          {/* 移动端：左侧 Drawer */}
          {isMobile && (
            <Drawer open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen} direction="left">
              <DrawerContent className="h-full max-w-[85%] sm:max-w-sm">
                <div className="h-full overflow-hidden">
                  <LeftPanel
                    novelTitle={novel.title}
                    novelId={novelId!}
                    chapters={formattedChapters}
                    volumes={volumes}
                    selectedChapter={selectedChapter}
                    activeTab={activeLeftTab as LeftTabType}
                    onTabChange={setActiveLeftTab as (tab: LeftTabType) => void}
                    onSelectChapter={handleSelectChapter}
                    onCreateChapter={handleOpenCreateChapterDialog}
                    onCreateVolume={handleOpenCreateVolumeDialog}
                    onReorderChapters={handleReorderChapters}
                    onReorderVolumes={handleReorderVolumes}
                    onMoveChapterToVolume={handleMoveChapterToVolume}
                    onRenameChapter={handleRenameChapter}
                    onDeleteChapter={handleDeleteChapter}
                    onCopyChapter={handleCopyChapter}
                    onMoveChapter={handleMoveChapter}
                    onRenameVolume={handleRenameVolume}
                    onDeleteVolume={handleDeleteVolume}
                    onChaptersImported={handleChaptersImported}
                    onImageGenerated={handleImageGenerated}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          )}

          {/* 移动端：右侧 AI 助手 Drawer */}
          {isMobile && (
            <Drawer open={rightDrawerOpen} onOpenChange={setRightDrawerOpen} direction="right">
              <DrawerContent className="h-full max-w-[85%] sm:max-w-sm">
                <div className="h-full overflow-hidden">
                  <RightPanel />
                </div>
              </DrawerContent>
            </Drawer>
          )}

          <CreateChapterDialog
            open={createChapterDialogOpen}
            onOpenChange={setCreateChapterDialogOpen}
            title={newChapterTitle}
            onTitleChange={setNewChapterTitle}
            onConfirm={handleCreateChapter}
            isCreating={isCreatingChapter}
            volumes={volumes}
            selectedVolumeId={newChapterVolumeId}
            onSelectedVolumeIdChange={setNewChapterVolumeId}
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

          <RenameChapterDialog
            open={renameChapterDialogOpen}
            onOpenChange={setRenameChapterDialogOpen}
            title={editingChapterTitle}
            onTitleChange={setEditingChapterTitle}
            onConfirm={handleConfirmRenameChapter}
            isUpdating={isUpdatingChapter}
          />

          <RenameVolumeDialog
            open={renameVolumeDialogOpen}
            onOpenChange={setRenameVolumeDialogOpen}
            title={editingVolumeTitle}
            onTitleChange={setEditingVolumeTitle}
            onConfirm={handleConfirmRenameVolume}
            isUpdating={isUpdatingVolume}
          />

          <DeleteConfirmDialog
            open={deleteChapterDialogOpen}
            onOpenChange={setDeleteChapterDialogOpen}
            title="确认删除章节"
            description={`确定要删除章节"${chapterToDelete?.title}"吗？此操作不可恢复。`}
            onConfirm={handleConfirmDeleteChapter}
            isDeleting={isDeletingChapter}
          />

          <MoveChapterDialog
            open={moveChapterDialogOpen}
            onOpenChange={setMoveChapterDialogOpen}
            chapterTitle={chapterToMove?.title || ''}
            volumes={volumes || []}
            onConfirm={handleConfirmMoveChapter}
            isMoving={isMovingChapter}
          />

          <DeleteConfirmDialog
            open={deleteVolumeDialogOpen}
            onOpenChange={setDeleteVolumeDialogOpen}
            title="确认删除卷"
            description={`确定要删除卷"${volumeToDelete?.title}"吗？此操作不可恢复，卷下的所有章节将被移出。`}
            onConfirm={handleConfirmDeleteVolume}
            isDeleting={isDeletingVolume}
          />
        </div>
      </LockScreen>

      <ChapterQuickSearchDialog
        open={quickSearchOpen}
        onOpenChange={setQuickSearchOpen}
        chapters={chapters.map(c => ({ id: c.id, title: c.title }))}
        currentChapterId={activeTab}
        onSelectChapter={handleSelectChapter}
      />

      {characterPanelOpen && (
        <div
          className={`fixed inset-0 z-[100] bg-background group ${
            characterPanelClosing
              ? 'animate-panel-close'
              : 'animate-panel-open'
          }`}
          onAnimationEnd={() => {
            if (characterPanelClosing) {
              setCharacterPanelOpen(false)
              setCharacterPanelClosing(false)
            }
          }}
        >
          <CharacterPanel novelId={novelId!} novelTitle={novel?.title} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={() => setCharacterPanelClosing(true)}
              className="w-10 h-6 bg-accent/90 hover:bg-accent transition-colors cursor-pointer backdrop-blur-sm flex items-center justify-center rounded-t-md"
              style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)' }}
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </Tooltip.Provider>
  )
}

export default function NovelsEdit() {
  return (
    <Suspense fallback={(
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-3">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">加载中...</span>
      </div>
    )}
    >
      <NovelsEditContent />
    </Suspense>
  )
}
