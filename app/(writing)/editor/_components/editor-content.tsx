/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
import type { Chapter, Volume } from '@/lib/supabase/sdk'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { TiptapEditor } from '@/components/tiptap'
import { Spinner } from '@/components/ui/spinner'
import { chaptersApi } from '@/lib/supabase/sdk'
import { Breadcrumb } from './breadcrumb'
import { SmartTabs } from './smart-tabs'

interface Tab {
  id: string
  title: string
}

interface EditorContentProps {
  openTabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  onTabClose: (id: string) => void
  onTabCloseOthers?: (id: string) => void
  onTabCloseAll?: () => void
  onTabCloseLeft?: (id: string) => void
  onTabCloseRight?: (id: string) => void
  novelTitle: string
  chapterTitle: string
  chapterId: string
  volumes?: Volume[]
  chapters?: Chapter[]
  onSelectChapter?: (chapterId: string) => void
}

const EMPTY_ARRAY: never[] = []

export default function EditorContent({
  openTabs,
  activeTab,
  onTabChange,
  onTabClose,
  onTabCloseOthers,
  onTabCloseAll,
  onTabCloseLeft,
  onTabCloseRight,
  novelTitle,
  chapterTitle,
  chapterId,
  volumes = EMPTY_ARRAY,
  chapters = EMPTY_ARRAY,
  onSelectChapter,
}: EditorContentProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const editorContentRef = useRef<string>('')
  const isSavingRef = useRef(false)

  // 找到当前章节所属的卷（优先使用传入的 chapters 数据，不等待加载）
  const currentVolume = useMemo(() => {
    // 先从传入的 chapters 中查找当前章节
    const currentChapterData = chapters.find(c => c.id === chapterId)
    const volumeId = currentChapterData?.volume_id || chapter?.volume_id

    if (!volumeId) return null
    return volumes.find(v => v.id === volumeId) || null
  }, [chapterId, chapters, chapter?.volume_id, volumes])

  // 加载章节内容
  useEffect(() => {
    if (!chapterId) return

    // 重置状态
    setLastSaved(null)
    editorContentRef.current = ''

    const loadChapter = async () => {
      try {
        setLoading(true)
        console.log('📖 开始加载章节:', chapterId)
        const data = await chaptersApi.getById(chapterId)
        console.log('✅ 章节加载成功:', {
          chapterId: data.id,
          title: data.title,
          contentLength: data.content?.length || 0,
          wordCount: data.word_count,
        })
        setChapter(data)
        editorContentRef.current = data.content // 初始化 ref
      } catch (error) {
        console.error('❌ 加载章节失败:', error)
        const message = error instanceof Error ? error.message : '加载章节失败'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    loadChapter()
  }, [chapterId])

  const handleUpdate = async (content: string) => {
    editorContentRef.current = content
    console.log('🔄 自动保存触发:', { chapterId, contentLength: content?.length || 0 })
    if (!chapterId) return

    try {
      setIsSaving(true)
      await chaptersApi.update({ id: chapterId, content })
      // 更新本地 chapter state，确保切换章节后能加载最新内容
      setChapter(prev => (prev ? { ...prev, content } : null))
      setLastSaved(new Date())
      console.log('✅ 自动保存完成')
    } catch (error) {
      console.error('❌ 保存失败:', error)
      const message = error instanceof Error ? error.message : '保存失败'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  // 手动保存
  const handleManualSave = useCallback(async () => {
    if (!chapterId || isSavingRef.current) return

    try {
      isSavingRef.current = true
      setIsSaving(true)
      const content = editorContentRef.current
      console.log('💾 手动保存触发 (Ctrl+S):', { chapterId, contentLength: content?.length || 0 })
      await chaptersApi.update({
        id: chapterId,
        content,
      })
      // 更新本地 chapter state，确保切换章节后能加载最新内容
      setChapter(prev => (prev ? { ...prev, content } : null))
      setLastSaved(new Date())
      console.log('✅ 手动保存完成')
      toast.success('保存成功', { duration: 1500 })
    } catch (error) {
      console.error('❌ 手动保存失败:', error)
      const message = error instanceof Error ? error.message : '保存失败'
      toast.error(message)
    } finally {
      setIsSaving(false)
      isSavingRef.current = false
    }
  }, [chapterId])

  const handleStatsChange = (stats: { words: number, characters: number }) => {
    setWordCount(stats.words)
    setCharCount(stats.characters)
  }

  // 监听 Ctrl+S 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S (Windows/Linux) 或 Cmd+S (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleManualSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleManualSave])

  // 页面刷新前提醒保存
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 如果正在保存或者最近刚保存过（5秒内），则不提示
      const timeSinceLastSave = lastSaved ? Date.now() - lastSaved.getTime() : Infinity
      if (isSaving || timeSinceLastSave < 5000) {
        return
      }

      // 如果有未保存的内容，提示用户
      e.preventDefault()
      e.returnValue = '您有未保存的内容，确定要离开吗？'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isSaving, lastSaved])

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* 顶部页签区域 */}
      <SmartTabs
        tabs={openTabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onTabClose={onTabClose}
        onTabCloseOthers={onTabCloseOthers}
        onTabCloseAll={onTabCloseAll}
        onTabCloseLeft={onTabCloseLeft}
        onTabCloseRight={onTabCloseRight}
      />

      {/* 面包屑导航 */}
      <Breadcrumb
        novelTitle={novelTitle}
        chapterTitle={chapterTitle}
        volume={currentVolume}
        chapters={chapters}
        currentChapterId={chapterId}
        onSelectChapter={onSelectChapter}
      />

      {/* 编辑器内容区域 */}
      <div className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {loading
          ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Spinner className="w-8 h-8" />
                <span className="text-sm text-gray-500 dark:text-gray-400">加载中...</span>
              </div>
            )
          : (
              <TiptapEditor
                key={chapterId}
                content={chapter?.content || `<h1>${chapterTitle}</h1>`}
                placeholder="开始写作..."
                onUpdate={handleUpdate}
                onStatsChange={handleStatsChange}
                autoSave={true}
                autoSaveDelay={3000}
                className="max-w-4xl mx-auto"
                editable={true}
                chapterId={chapterId}
              />
            )}
      </div>

      {/* 底部状态栏 */}
      <div className="h-10 px-6 flex items-center justify-end bg-gray-50 dark:bg-zinc-800/50">
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>
            字数：
            {wordCount.toLocaleString()}
          </span>
          <span>•</span>
          <span>
            字符：
            {charCount.toLocaleString()}
          </span>
          <span>•</span>
          {isSaving
            ? (
                <span className="text-gray-700 dark:text-gray-300">保存中...</span>
              )
            : lastSaved
              ? (
                  <span>已保存</span>
                )
              : (
                  <span>未保存</span>
                )}
        </div>
      </div>
    </div>
  )
}
