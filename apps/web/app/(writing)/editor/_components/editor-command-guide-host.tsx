'use client'

import { useEffect, useState } from 'react'
import { openEditorCommandGuide, subscribeEditorCommandGuide } from '@/lib/editor/command-guide-bus'
import { EditorCommandGuideDialog } from './editor-command-guide-dialog'

export function EditorCommandGuideHost() {
  const [open, setOpen] = useState(false)

  useEffect(() => subscribeEditorCommandGuide(() => setOpen(true)), [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <EditorCommandGuideDialog
      open={open}
      onOpenChange={setOpen}
    />
  )
}

export { openEditorCommandGuide }
