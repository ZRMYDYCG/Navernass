'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { PlanEditor } from '@/components/tiptap'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/hooks/use-i18n'
import { toVirtualPlanPath } from '@/lib/editor/plan-path'
import { planFilesApi } from '@/lib/supabase/sdk'
import { usePlanStore } from '@/store'
import { useEditorSurfacePreferences } from '../_hooks/use-editor-surface-preferences'
import { EditorSurfaceArcPicker } from './editor-surface-arc-picker'
import { EditorSurfaceScrollArea } from './editor-surface-scroll-area'
import { EditorSurfaceTypographyPicker } from './editor-surface-typography-picker'
import { SmartTabs } from './smart-tabs'

interface Tab {
  id: string
  title: string
}

interface PlanFileEditorProps {
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
  planFileId: string
}

export function PlanFileEditor({
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
  planFileId,
}: PlanFileEditorProps) {
  const { t } = useI18n()
  const cachedPlanFile = usePlanStore(s => s.plan.planFilesById[planFileId])
  const upsertPlanFile = usePlanStore(s => s.planActions.upsertPlanFile)
  const {
    editorSurface,
    editorFontSize,
    typography,
    handleEditorSurfaceChange,
    handleEditorFontSizeChange,
    handleTypographyChange,
  } = useEditorSurfacePreferences(novelId)

  const [planFile, setPlanFile] = useState(cachedPlanFile ?? null)
  const [loading, setLoading] = useState(!cachedPlanFile)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const editorContentRef = useRef('')
  const loadingIdRef = useRef<string | null>(null)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (!planFileId || loadingIdRef.current === planFileId) return

    if (cachedPlanFile) {
      setPlanFile(cachedPlanFile)
      editorContentRef.current = cachedPlanFile.content
      setLoading(false)
      return
    }

    loadingIdRef.current = planFileId
    editorContentRef.current = ''

    const load = async () => {
      try {
        setLoading(true)
        const data = await planFilesApi.getById(planFileId)
        if (loadingIdRef.current === planFileId) {
          setPlanFile(data)
          editorContentRef.current = data.content
          upsertPlanFile(data)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : t('editor.planFile.loadFailed')
        toast.error(message)
      } finally {
        setLoading(false)
        if (loadingIdRef.current === planFileId) {
          loadingIdRef.current = null
        }
      }
    }

    void load()
  }, [planFileId, cachedPlanFile, upsertPlanFile, t])

  const saveContent = useCallback(async (content: string, silent = false) => {
    if (!planFileId || isSavingRef.current) return

    try {
      isSavingRef.current = true
      setIsSaving(true)
      const updated = await planFilesApi.update(planFileId, { content })
      setPlanFile(updated)
      upsertPlanFile(updated)
      setLastSaved(new Date())
      if (!silent) {
        toast.success(t('editor.messages.saveSuccess'), { duration: 1500 })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('editor.messages.saveFailed')
      toast.error(message)
    } finally {
      setIsSaving(false)
      isSavingRef.current = false
    }
  }, [planFileId, upsertPlanFile, t])

  const handleUpdate = async (content: string) => {
    editorContentRef.current = content
    await saveContent(content, true)
  }

  const handleManualSave = useCallback(async () => {
    await saveContent(editorContentRef.current, false)
  }, [saveContent])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        void handleManualSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleManualSave])

  const virtualPath = planFile ? toVirtualPlanPath(planFile.path) : ''

  return (
    <div className="h-full flex flex-col bg-background">
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

      <div className="h-9 px-4 flex items-center justify-between border-b border-border bg-sidebar/50 backdrop-blur-sm shrink-0">
        <div className="min-w-0 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate font-serif">{novelTitle}</span>
          <span>/</span>
          <span className="truncate text-foreground">{t('editor.leftPanel.planDrawer.title')}</span>
          <span>/</span>
          <span className="truncate font-medium text-foreground">{planFile?.name || '…'}</span>
        </div>
        <div className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
          {isSaving
            ? t('editor.status.saving')
            : lastSaved
              ? t('editor.status.saved')
              : virtualPath}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {loading
          ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <Spinner className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-light tracking-wider">{t('editor.editor.loading')}</span>
              </div>
            )
          : (
              <EditorSurfaceScrollArea
                editorSurface={editorSurface}
                fontSize={editorFontSize}
                typography={typography}
                onFontSizeChange={handleEditorFontSizeChange}
                className="h-full"
              >
                <div className="px-8 sm:px-12 min-h-full py-6">
                  <PlanEditor
                    key={planFileId}
                    planFileId={planFileId}
                    content={planFile?.content || ''}
                    placeholder={t('editor.planFile.placeholder')}
                    onUpdate={handleUpdate}
                    autoSave={true}
                    autoSaveDelay={3000}
                    className="outline-none"
                    editable={true}
                  />
                </div>
              </EditorSurfaceScrollArea>
            )}
      </div>

      <div className="h-10 px-6 flex items-center justify-between border-t border-border bg-transparent backdrop-blur-sm shrink-0">
        <div className="flex min-w-0 items-center gap-1">
          <EditorSurfaceArcPicker
            value={editorSurface}
            onChange={handleEditorSurfaceChange}
          />
          <EditorSurfaceTypographyPicker
            value={typography}
            onChange={handleTypographyChange}
          />
        </div>
      </div>
    </div>
  )
}
