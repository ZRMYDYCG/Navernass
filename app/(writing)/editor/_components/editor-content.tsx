import type { Chapter, Volume } from '@/lib/supabase/sdk'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { TiptapEditor } from '@/components/tiptap'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { chaptersApi } from '@/lib/supabase/sdk'
import { cn } from '@/lib/utils'
import { useCharacterMaterialStore } from '@/store'
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
  novelId: string
  novelTitle: string
  chapterTitle: string
  chapterId: string
  volumes?: Volume[]
  chapters?: Chapter[]
  onSelectChapter?: (chapterId: string) => void
}

const EMPTY_ARRAY: never[] = []
const SUGGESTION_MARKER_REGEX = /data-suggestion="(?:add|del)"|suggestion-(?:add|del)/i
const DEFAULT_EDITOR_SURFACE = 'paper'
const EDITOR_SURFACE_OPTIONS = [
  { value: 'paper', note: '纸感', surfaceClassName: 'bg-card bg-paper-texture', swatchClassName: 'bg-card' },
  { value: 'plain', note: '素净', surfaceClassName: 'bg-background', swatchClassName: 'bg-background' },
  { value: 'mist', note: '雾灰', surfaceClassName: 'bg-muted/35', swatchClassName: 'bg-muted/70' },
  { value: 'soft', note: '柔光', surfaceClassName: 'bg-accent/40', swatchClassName: 'bg-accent/70' },
  { value: 'rice', note: '轻米白', surfaceClassName: 'bg-[#f7f2e8] bg-paper-texture', swatchClassName: 'bg-[#f7f2e8]' },
  { value: 'aged', note: '旧纸', surfaceClassName: 'bg-[#eadfc8] bg-paper-texture', swatchClassName: 'bg-[#eadfc8]' },
  { value: 'cool', note: '冷白', surfaceClassName: 'bg-[#f3f7fb]', swatchClassName: 'bg-[#f3f7fb]' },
  { value: 'night', note: '夜纸', surfaceClassName: 'bg-[#17151d] text-zinc-100', swatchClassName: 'bg-[#17151d]' },
] as const

const getEditorSurfaceStorageKey = (novelId: string) => `editor-surface:${novelId}`

const hasSuggestionMarkup = (content: string) => SUGGESTION_MARKER_REGEX.test(content)

export default function EditorContent({
  openTabs,
  activeTab,
  onTabChange,
  onTabClose,
  onTabCloseOthers,
  onTabCloseAll,
  onTabCloseLeft,
  onTabCloseRight,
  novelId,
  novelTitle,
  chapterTitle,
  chapterId,
  volumes = EMPTY_ARRAY,
  chapters = EMPTY_ARRAY,
  onSelectChapter,
}: EditorContentProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedMap, setLastSavedMap] = useState<Record<string, Date | null>>({})
  const lastSaved = lastSavedMap[chapterId] ?? null
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [editorSurface, setEditorSurface] = useState<(typeof EDITOR_SURFACE_OPTIONS)[number]['value']>(DEFAULT_EDITOR_SURFACE)
  const editorContentRef = useRef<string>('')
  const isSavingRef = useRef(false)

  const characters = useCharacterMaterialStore(state => state.characters)

  // 找到当前章节所属的卷（优先使用传入的 chapters 数据，不等待加载）
  const currentVolume = useMemo(() => {
    const currentChapterData = chapters.find(c => c.id === chapterId)
    const volumeId = currentChapterData?.volume_id || chapter?.volume_id

    if (!volumeId) return null
    return volumes.find(v => v.id === volumeId) || null
  }, [chapterId, chapters, chapter?.volume_id, volumes])

  const loadingChapterIdRef = useRef<string | null>(null)
  const currentEditorSurface = EDITOR_SURFACE_OPTIONS.find(option => option.value === editorSurface) || EDITOR_SURFACE_OPTIONS[0]

  useEffect(() => {
    const stored = window.localStorage.getItem(getEditorSurfaceStorageKey(novelId))
    const matched = EDITOR_SURFACE_OPTIONS.find(option => option.value === stored)
    setEditorSurface(matched?.value || DEFAULT_EDITOR_SURFACE)
  }, [novelId])

  const handleEditorSurfaceChange = (value: string) => {
    const matched = EDITOR_SURFACE_OPTIONS.find(option => option.value === value)
    if (!matched) return

    setEditorSurface(matched.value)
    window.localStorage.setItem(getEditorSurfaceStorageKey(novelId), matched.value)
  }

  // 加载章节内容
  useEffect(() => {
    if (!chapterId || loadingChapterIdRef.current === chapterId) return

    loadingChapterIdRef.current = chapterId
    editorContentRef.current = ''

    const loadChapter = async () => {
      try {
        setLoading(true)
        const data = await chaptersApi.getById(chapterId)
        if (loadingChapterIdRef.current === chapterId) {
          setChapter(data)
          editorContentRef.current = data.content
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '加载章节失败'
        toast.error(message)
      } finally {
        setLoading(false)
        if (loadingChapterIdRef.current === chapterId) {
          loadingChapterIdRef.current = null
        }
      }
    }

    loadChapter()
  }, [chapterId])

  const handleUpdate = async (content: string) => {
    editorContentRef.current = content
    if (!chapterId) return
    if (hasSuggestionMarkup(content)) return

    try {
      setIsSaving(true)
      await chaptersApi.update({ id: chapterId, content })
      // 更新本地 chapter state，确保切换章节后能加载最新内容
      setChapter(prev => (prev ? { ...prev, content } : null))
      setLastSavedMap(prev => ({ ...prev, [chapterId]: new Date() }))
    } catch (error) {
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
      if (hasSuggestionMarkup(content)) {
        toast('请先接受或拒绝修订内容再保存')
        return
      }
      await chaptersApi.update({
        id: chapterId,
        content,
      })
      setChapter(prev => (prev ? { ...prev, content } : null))
      setLastSavedMap(prev => ({ ...prev, [chapterId]: new Date() }))
      toast.success('保存成功', { duration: 1500 })
    } catch (error) {
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

  // 页面刷新前自动保存
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      const timeSinceLastSave = lastSaved ? Date.now() - lastSaved.getTime() : Infinity

      if (isSaving || timeSinceLastSave < 3000 || !chapterId) {
        return
      }

      const content = editorContentRef.current
      if (content && !hasSuggestionMarkup(content)) {
        e.preventDefault()
        e.returnValue = ''

        try {
          await fetch(`/api/chapters/${chapterId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          })
        } catch (error) {
          console.error('自动保存失败:', error)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [chapterId, isSaving, lastSaved])

  return (
    <div className="h-full flex flex-col bg-background">
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
      <div className={cn(
        'flex-1 min-h-0 overflow-y-auto transition-colors [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
        currentEditorSurface.surfaceClassName,
      )}
      >
        {loading
          ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <Spinner className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-light tracking-wider">正在铺开纸张...</span>
              </div>
            )
          : (
              <div className="px-8 sm:px-12 min-h-full">
                <TiptapEditor
                  key={chapterId}
                  content={chapter?.content || `<h1>${chapterTitle}</h1>`}
                  placeholder="在此写下故事的开始..."
                  onUpdate={handleUpdate}
                  onStatsChange={handleStatsChange}
                  autoSave={true}
                  autoSaveDelay={3000}
                  className="outline-none"
                  editable={true}
                  chapterId={chapterId}
                  characters={characters}
                />
              </div>
            )}
      </div>

      {/* 底部状态栏 */}
      <div className="h-10 px-6 flex items-center justify-between bg-transparent border-t border-border backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="whitespace-nowrap">卷面</span>
          <Select value={editorSurface} onValueChange={handleEditorSurfaceChange}>
            <SelectTrigger className="h-7 min-w-24 border-none bg-transparent px-2 text-xs shadow-none focus:ring-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full border border-border/60', currentEditorSurface.swatchClassName)} />
                <span>{currentEditorSurface.note}</span>
              </div>
            </SelectTrigger>
            <SelectContent align="start" className="z-[120] min-w-28">
              {EDITOR_SURFACE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full border border-border/60', option.swatchClassName)} />
                    <span>{option.note}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-light tracking-wide">
          <span>
            字数
            {' '}
            {wordCount.toLocaleString()}
          </span>
          <span className="opacity-30">|</span>
          <span>
            字符
            {' '}
            {charCount.toLocaleString()}
          </span>
          <span className="opacity-30">|</span>
          {isSaving
            ? (
                <span className="text-foreground animate-pulse">保存中...</span>
              )
            : lastSaved
              ? (
                  <span className="opacity-70">已保存</span>
                )
              : (
                  <span className="opacity-70">未保存</span>
                )}
        </div>
      </div>
    </div>
  )
}
