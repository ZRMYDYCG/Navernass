'use client'

import type { Editor } from '@tiptap/react'
import { Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'
import { useAppStore } from '@/store'
import { acceptSuggestions, documentHasSuggestions, rejectSuggestions } from './extensions/suggestion-track'

interface ProposeEditToolbarProps {
  editor: Editor | null
  chapterId?: string
}

export function ProposeEditToolbar({ editor, chapterId }: ProposeEditToolbarProps) {
  const { t } = useI18n()
  const resolveChapterEdits = useAppStore(s => s.aiEditsActions.resolveChapterEdits)
  const [hasSuggestions, setHasSuggestions] = useState(false)

  useEffect(() => {
    if (!editor) return

    const check = () => {
      setHasSuggestions(documentHasSuggestions(editor.state))
    }

    check()
    editor.on('transaction', check)
    return () => {
      editor.off('transaction', check)
    }
  }, [editor])

  if (!editor || !hasSuggestions) return null

  const handleAcceptAll = () => {
    const ok = acceptSuggestions(editor)
    if (!ok) {
      toast.info(t('editor.rightPanel.tools.proposeEdit.noSuggestions'))
      return
    }
    if (chapterId) resolveChapterEdits(chapterId, 'accepted')
    toast.success(t('editor.rightPanel.tools.proposeEdit.acceptedAll'))
  }

  const handleRejectAll = () => {
    const ok = rejectSuggestions(editor)
    if (!ok) {
      toast.info(t('editor.rightPanel.tools.proposeEdit.noSuggestions'))
      return
    }
    if (chapterId) resolveChapterEdits(chapterId, 'rejected')
    toast.success(t('editor.rightPanel.tools.proposeEdit.rejectedAll'))
  }

  return (
    <div className="absolute top-2 right-2 z-30 flex items-center gap-1 rounded-md border border-border bg-card/95 backdrop-blur-sm shadow-lg px-1.5 py-1 animate-in fade-in-0 slide-in-from-top-1 duration-200">
      <span className="text-[10px] text-muted-foreground px-1 shrink-0">
        {t('editor.rightPanel.tools.proposeEdit.toolbarLabel')}
      </span>
      <button
        type="button"
        onClick={handleAcceptAll}
        className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition-colors"
        title={t('editor.rightPanel.tools.proposeEdit.acceptAllTitle')}
      >
        <Check className="w-3 h-3 shrink-0" />
        {t('editor.rightPanel.tools.proposeEdit.acceptAll')}
      </button>
      <button
        type="button"
        onClick={handleRejectAll}
        className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 transition-colors"
        title={t('editor.rightPanel.tools.proposeEdit.rejectAllTitle')}
      >
        <X className="w-3 h-3 shrink-0" />
        {t('editor.rightPanel.tools.proposeEdit.rejectAll')}
      </button>
    </div>
  )
}
