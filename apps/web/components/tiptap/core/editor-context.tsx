'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import type {
  EditorAiInsertPayload,
  EditorHighlightPayload,
  EditorInsertImagePayload,
  EditorReadyPayload,
} from './types'

type Unsubscribe = () => void

interface EditorBridgeHandlers {
  onHighlight?: (payload: EditorHighlightPayload) => void
  onInsertImage?: (payload: EditorInsertImagePayload) => void
  onReady?: (payload: EditorReadyPayload) => void
}

interface EditorBridgeApi {
  chapterId?: string
  setChapterId: (chapterId: string | undefined) => void
  registerHandlers: (handlers: EditorBridgeHandlers) => Unsubscribe
  emitHighlight: (payload: EditorHighlightPayload) => void
  emitInsertImage: (payload: EditorInsertImagePayload) => void
  emitReady: (payload: EditorReadyPayload) => void
  emitAiInsert: (payload: EditorAiInsertPayload) => void
  subscribeAiInsert: (listener: (payload: EditorAiInsertPayload) => void) => Unsubscribe
}

const EditorBridgeContext = createContext<EditorBridgeApi | null>(null)

/** 模块级桥：供编辑器树外的面板（搜索 Tab、右侧 AI）订阅 */
const globalAiInsertListeners = new Set<(payload: EditorAiInsertPayload) => void>()
const globalHighlightListeners = new Set<(payload: EditorHighlightPayload) => void>()
const globalReadyListeners = new Set<(payload: EditorReadyPayload) => void>()
const globalInsertImageListeners = new Set<(payload: EditorInsertImagePayload) => void>()

export function emitGlobalAiInsert(payload: EditorAiInsertPayload) {
  globalAiInsertListeners.forEach(listener => listener(payload))
}

export function subscribeGlobalAiInsert(listener: (payload: EditorAiInsertPayload) => void): Unsubscribe {
  globalAiInsertListeners.add(listener)
  return () => globalAiInsertListeners.delete(listener)
}

export function emitGlobalEditorHighlight(payload: EditorHighlightPayload) {
  globalHighlightListeners.forEach(listener => listener(payload))
  window.dispatchEvent(new CustomEvent('editor-highlight', { detail: payload }))
}

export function subscribeGlobalEditorHighlight(listener: (payload: EditorHighlightPayload) => void): Unsubscribe {
  globalHighlightListeners.add(listener)
  const windowListener = (event: Event) => {
    listener((event as CustomEvent<EditorHighlightPayload>).detail)
  }
  window.addEventListener('editor-highlight', windowListener)
  return () => {
    globalHighlightListeners.delete(listener)
    window.removeEventListener('editor-highlight', windowListener)
  }
}

export function emitGlobalEditorReady(payload: EditorReadyPayload) {
  globalReadyListeners.forEach(listener => listener(payload))
  window.dispatchEvent(new CustomEvent('editor-ready', { detail: payload }))
}

export function subscribeGlobalEditorReady(listener: (payload: EditorReadyPayload) => void): Unsubscribe {
  globalReadyListeners.add(listener)
  const windowListener = (event: Event) => {
    listener((event as CustomEvent<EditorReadyPayload>).detail)
  }
  window.addEventListener('editor-ready', windowListener)
  return () => {
    globalReadyListeners.delete(listener)
    window.removeEventListener('editor-ready', windowListener)
  }
}

export function emitGlobalInsertImage(payload: EditorInsertImagePayload) {
  globalInsertImageListeners.forEach(listener => listener(payload))
  window.dispatchEvent(new CustomEvent('novel-insert-image-to-editor', { detail: payload }))
}

export function subscribeGlobalInsertImage(listener: (payload: EditorInsertImagePayload) => void): Unsubscribe {
  globalInsertImageListeners.add(listener)
  const windowListener = (event: Event) => {
    listener((event as CustomEvent<EditorInsertImagePayload>).detail)
  }
  window.addEventListener('novel-insert-image-to-editor', windowListener)
  return () => {
    globalInsertImageListeners.delete(listener)
    window.removeEventListener('novel-insert-image-to-editor', windowListener)
  }
}

export function EditorBridgeProvider({
  children,
  chapterId: initialChapterId,
}: {
  children: ReactNode
  chapterId?: string
}) {
  const chapterIdRef = useRef(initialChapterId)
  const handlersRef = useRef<Set<EditorBridgeHandlers>>(new Set())

  useEffect(() => {
    chapterIdRef.current = initialChapterId
  }, [initialChapterId])

  const registerHandlers = useCallback((handlers: EditorBridgeHandlers) => {
    handlersRef.current.add(handlers)
    return () => {
      handlersRef.current.delete(handlers)
    }
  }, [])

  const emitHighlight = useCallback((payload: EditorHighlightPayload) => {
    handlersRef.current.forEach(h => h.onHighlight?.(payload))
    emitGlobalEditorHighlight(payload)
  }, [])

  const emitInsertImage = useCallback((payload: EditorInsertImagePayload) => {
    handlersRef.current.forEach(h => h.onInsertImage?.(payload))
    emitGlobalInsertImage(payload)
  }, [])

  const emitReady = useCallback((payload: EditorReadyPayload) => {
    handlersRef.current.forEach(h => h.onReady?.(payload))
    emitGlobalEditorReady(payload)
  }, [])

  const emitAiInsert = useCallback((payload: EditorAiInsertPayload) => {
    emitGlobalAiInsert(payload)
  }, [])

  const subscribeAiInsert = useCallback((listener: (payload: EditorAiInsertPayload) => void) => {
    return subscribeGlobalAiInsert(listener)
  }, [])

  const value = useMemo<EditorBridgeApi>(() => ({
    get chapterId() {
      return chapterIdRef.current
    },
    setChapterId(chapterId) {
      chapterIdRef.current = chapterId
    },
    registerHandlers,
    emitHighlight,
    emitInsertImage,
    emitReady,
    emitAiInsert,
    subscribeAiInsert,
  }), [registerHandlers, emitHighlight, emitInsertImage, emitReady, emitAiInsert, subscribeAiInsert])

  return (
    <EditorBridgeContext.Provider value={value}>
      {children}
    </EditorBridgeContext.Provider>
  )
}

export function useEditorBridge() {
  const ctx = useContext(EditorBridgeContext)
  if (!ctx) {
    throw new Error('useEditorBridge must be used within EditorBridgeProvider')
  }
  return ctx
}

export function useOptionalEditorBridge() {
  return useContext(EditorBridgeContext)
}
