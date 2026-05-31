'use client'

import type { ReactNode } from 'react'
import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react'
import { NovelChatContext, useNovelChatContext, type NovelChatRuntime } from './context'
import { NovelChatSessionHost } from './session-host'
import { useNovelChatStore } from '@/store'

interface NovelChatProviderProps {
  children: ReactNode
}

export function NovelChatProvider({ children }: NovelChatProviderProps) {
  const mountedNovelIds = useNovelChatStore(s => s.mountedSessionNovelIds)
  const mountSession = useNovelChatStore(s => s.mountSession)
  const runtimeMapRef = useRef<Map<string, NovelChatRuntime>>(new Map())
  const runtimeVersionRef = useRef<Record<string, number>>({})
  const novelListenersRef = useRef<Map<string, Set<() => void>>>(new Map())

  const ensureUiSession = useNovelChatStore(s => s.ensureUiSession)

  const notifyNovel = useCallback((novelId: string) => {
    runtimeVersionRef.current[novelId] = (runtimeVersionRef.current[novelId] ?? 0) + 1
    novelListenersRef.current.get(novelId)?.forEach(listener => listener())
  }, [])

  const registerRuntime = useCallback((novelId: string, runtime: NovelChatRuntime | null) => {
    if (runtime) {
      runtimeMapRef.current.set(novelId, runtime)
      notifyNovel(novelId)
    }
    // 不在 unmount 时 delete —— 后台流式期间保持 runtime，避免切换 project 时串台或闪空
  }, [notifyNovel])

  const ensureSession = useCallback((novelId: string) => {
    ensureUiSession(novelId)
    mountSession(novelId)
  }, [ensureUiSession, mountSession])

  const subscribeNovel = useCallback((novelId: string, listener: () => void) => {
    if (!novelListenersRef.current.has(novelId)) {
      novelListenersRef.current.set(novelId, new Set())
    }
    novelListenersRef.current.get(novelId)!.add(listener)
    return () => {
      novelListenersRef.current.get(novelId)?.delete(listener)
    }
  }, [])

  const getRuntimeVersion = useCallback((novelId: string) => {
    return runtimeVersionRef.current[novelId] ?? 0
  }, [])

  const getRuntime = useCallback((novelId: string) => {
    return runtimeMapRef.current.get(novelId)
  }, [])

  const contextValue = useMemo(() => ({
    ensureSession,
    getRuntime,
    subscribeNovel,
    getRuntimeVersion,
  }), [ensureSession, getRuntime, subscribeNovel, getRuntimeVersion])

  return (
    <NovelChatContext.Provider value={contextValue}>
      {mountedNovelIds.map(novelId => (
        <NovelChatSessionHost
          key={novelId}
          novelId={novelId}
          registerRuntime={registerRuntime}
        />
      ))}
      {children}
    </NovelChatContext.Provider>
  )
}

export function useNovelChatRuntime(novelId: string) {
  const { subscribeNovel, getRuntime, getRuntimeVersion } = useNovelChatContext()
  useSyncExternalStore(
    listener => subscribeNovel(novelId, listener),
    () => getRuntimeVersion(novelId),
    () => getRuntimeVersion(novelId),
  )
  const runtime = getRuntime(novelId)
  if (!novelId || !runtime || runtime.novelId !== novelId) return undefined
  return runtime
}