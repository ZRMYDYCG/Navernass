import type { Editor } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { useOptionalEditorBridge } from '@/components/tiptap/core/editor-context'
import {
  subscribeGlobalEditorHighlight,
  subscribeGlobalInsertImage,
} from '@/components/tiptap/core/editor-context'
import { updateSearchHighlight } from '@/components/tiptap/extensions/novel/search-highlight'

export function useEditorBridgeEvents(editor: Editor | null, chapterId?: string) {
  const bridge = useOptionalEditorBridge()

  useEffect(() => {
    if (!editor || !chapterId) return

    return subscribeGlobalEditorHighlight((payload) => {
      if (payload.chapterId === chapterId) {
        updateSearchHighlight(editor.view, payload.chapterId, payload.keyword, payload.matches)
      } else if (payload.chapterId === null) {
        updateSearchHighlight(editor.view, null, null, [])
      }
    })
  }, [editor, chapterId])

  useEffect(() => {
    if (!editor) return

    return subscribeGlobalInsertImage((payload) => {
      if (!payload.imageUrl) return
      editor.chain().focus().insertContent({
        type: 'image',
        attrs: { src: payload.imageUrl },
      }).run()
    })
  }, [editor])

  useEffect(() => {
    if (!editor || !chapterId || !bridge) return

    const timeoutId = setTimeout(() => {
      bridge.emitReady({ chapterId })
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [editor, chapterId, bridge])
}

export function useEditorSearchShortcut(editor: Editor | null) {
  const [showSearchBox, setShowSearchBox] = useState(false)
  const [initialSearchTerm, setInitialSearchTerm] = useState('')

  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        const target = e.target as HTMLElement
        const isInEditor = editor.view.dom.contains(target) || target.closest('.ProseMirror')
        if (!isInEditor && showSearchBox) return

        e.preventDefault()
        e.stopPropagation()

        const { from, to } = editor.state.selection
        setInitialSearchTerm(from !== to ? editor.state.doc.textBetween(from, to, ' ') : '')
        setShowSearchBox(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [editor, showSearchBox])

  return {
    showSearchBox,
    setShowSearchBox,
    initialSearchTerm,
    setInitialSearchTerm,
  }
}

export function useEditorImageBindings(editor: Editor | null) {
  useEffect(() => {
    if (!editor) return

    const editorElement = editor.view.dom
    const unbindMap = new WeakMap<HTMLImageElement, () => void>()

    const bindImage = (img: HTMLImageElement) => {
      const imageSrc = img.currentSrc || img.src
      if (img.dataset.boundImageSrc === imageSrc) return

      unbindMap.get(img)?.()
      img.dataset.boundImageSrc = imageSrc
      img.dataset.imageLoading = 'true'
      img.dataset.imageLoaded = 'false'

      const onLoad = () => {
        img.dataset.imageLoading = 'false'
        img.dataset.imageLoaded = 'true'
      }
      const onError = () => {
        img.dataset.imageLoading = 'false'
        img.dataset.imageLoaded = 'false'
      }

      if (img.complete && img.naturalWidth > 0) onLoad()
      else {
        img.addEventListener('load', onLoad)
        img.addEventListener('error', onError)
      }

      unbindMap.set(img, () => {
        img.removeEventListener('load', onLoad)
        img.removeEventListener('error', onError)
        unbindMap.delete(img)
      })
    }

    const bindAllImages = () => {
      editorElement.querySelectorAll('img').forEach(img => bindImage(img as HTMLImageElement))
    }

    bindAllImages()
    const observer = new MutationObserver(bindAllImages)
    observer.observe(editorElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
    })

    return () => {
      observer.disconnect()
      editorElement.querySelectorAll('img').forEach(img => {
        unbindMap.get(img as HTMLImageElement)?.()
      })
    }
  }, [editor])
}
