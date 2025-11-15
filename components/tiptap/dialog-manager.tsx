'use client'

import { createContext, use, useCallback, useMemo, useState } from 'react'
import { InputDialog } from './input-dialog'

export interface DialogConfig {
  title: string
  placeholder: string
  defaultValue?: string
}


interface DialogContextValue {
  showInputDialog: (config: DialogConfig) => Promise<string | null>
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

  const showInputDialog = useCallback((config: DialogConfig): Promise<string | null> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        config,
        resolve,
      })
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

  const contextValue = useMemo(() => ({ showInputDialog }), [showInputDialog])

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
    </DialogContext>
  )
}

// 全局 dialog 实例（用于非 React 上下文）
let globalDialogResolver: ((config: DialogConfig) => Promise<string | null>) | null = null

export function setGlobalDialog(resolver: (config: DialogConfig) => Promise<string | null>) {
  globalDialogResolver = resolver
}

export async function showGlobalInputDialog(config: DialogConfig): Promise<string | null> {
  if (!globalDialogResolver) {
    // Fallback - 不应该发生
    console.error('Dialog not initialized')
    return null
  }
  return globalDialogResolver(config)
}
