'use client'

import { createContext, use, useCallback, useMemo, useState } from 'react'
import { InputDialog } from './input-dialog'
import { ImageGenerationDialog } from './image-generation-dialog'

export interface DialogConfig {
  title: string
  placeholder: string
  defaultValue?: string
}

export interface ImageGenerationConfig {
  onConfirm: (prompt: string, size: string) => Promise<void> | void
  isGenerating?: boolean
}


interface DialogContextValue {
  showInputDialog: (config: DialogConfig) => Promise<string | null>
  showImageGenerationDialog: (config: ImageGenerationConfig) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

export function useDialog() {
  const context = use(DialogContext)
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider')
  }
  return context
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    config: DialogConfig
    resolve: ((value: string | null) => void) | null
  }>({
    isOpen: false,
    config: { title: '', placeholder: '' },
    resolve: null,
  })

  const [imageGenState, setImageGenState] = useState<{
    isOpen: boolean
    onConfirm: ((prompt: string, size: string) => Promise<void> | void) | null
    isGenerating: boolean
  }>({
    isOpen: false,
    onConfirm: null,
    isGenerating: false,
  })

  const showInputDialog = useCallback((config: DialogConfig): Promise<string | null> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        config,
        resolve,
      })
    })
  }, [])

  const showImageGenerationDialog = useCallback((config: ImageGenerationConfig) => {
    setImageGenState({
      isOpen: true,
      onConfirm: config.onConfirm,
      isGenerating: config.isGenerating || false,
    })
  }, [])

  const handleConfirm = useCallback((value: string) => {
    setDialogState((prev) => {
      prev.resolve?.(value)
      return { ...prev, isOpen: false, resolve: null }
    })
  }, [])

  const handleCancel = useCallback(() => {
    setDialogState((prev) => {
      prev.resolve?.(null)
      return { ...prev, isOpen: false, resolve: null }
    })
  }, [])

  const handleImageGenCancel = useCallback(() => {
    setImageGenState((prev) => ({
      ...prev,
      isOpen: false,
      onConfirm: null,
    }))
  }, [])

  const handleImageGenConfirm = useCallback(async (prompt: string, size: string) => {
    setImageGenState((prev) => ({ ...prev, isGenerating: true }))
    try {
      await imageGenState.onConfirm?.(prompt, size)
    } finally {
      setImageGenState((prev) => ({
        ...prev,
        isOpen: false,
        onConfirm: null,
        isGenerating: false,
      }))
    }
  }, [imageGenState.onConfirm])

  const contextValue = useMemo(
    () => ({ showInputDialog, showImageGenerationDialog }),
    [showInputDialog, showImageGenerationDialog]
  )

  return (
    <DialogContext value={contextValue}>
      {children}
      <InputDialog
        isOpen={dialogState.isOpen}
        title={dialogState.config.title}
        placeholder={dialogState.config.placeholder}
        defaultValue={dialogState.config.defaultValue}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <ImageGenerationDialog
        isOpen={imageGenState.isOpen}
        onConfirm={handleImageGenConfirm}
        onCancel={handleImageGenCancel}
        isGenerating={imageGenState.isGenerating}
      />
    </DialogContext>
  )
}

// 全局 dialog 实例（用于非 React 上下文）
let globalDialogResolver: ((config: DialogConfig) => Promise<string | null>) | null = null
let globalImageGenResolver: ((config: ImageGenerationConfig) => void) | null = null

export function setGlobalDialog(
  dialogResolver: (config: DialogConfig) => Promise<string | null>,
  imageGenResolver: (config: ImageGenerationConfig) => void
) {
  globalDialogResolver = dialogResolver
  globalImageGenResolver = imageGenResolver
}

export async function showGlobalInputDialog(config: DialogConfig): Promise<string | null> {
  if (!globalDialogResolver) {
    console.error('Dialog not initialized')
    return null
  }
  return globalDialogResolver(config)
}

export function showGlobalImageGenerationDialog(config: ImageGenerationConfig) {
  if (!globalImageGenResolver) {
    console.error('Image generation dialog not initialized')
    return
  }
  globalImageGenResolver(config)
}
