'use client'

import type {
  SerializedBookRef,
  SerializedCharacterRef,
} from '@/lib/editor/inline-composer'
import { useEffect, useMemo, useState } from 'react'
import { novelsApi } from '@/lib/supabase/sdk'

interface RawNovelCharacter {
  id?: string
  name?: string
  role?: string
  description?: string
  traits?: string[]
  keywords?: string[]
}

/**
 * 主聊天页 @ 引用数据源：
 * 1) 拉当前用户全部小说（每本带 characters jsonb 字段）
 * 2) 把所有书本的 characters 数组合并为角色列表
 * 3) 暴露给 InlineChapterComposer 作为 picker 选项
 *
 * 选择态（bookRefs / characterRefs）由 ChatAgentInput 通过 onBooksChange /
 * onCharactersChange 回调更新；调用方通常用一个 ref 把这些 id 桥接给
 * useChatConversation 的 transport，sendMessage 时写入请求体。
 */
export function useChatMentions() {
  const [books, setBooks] = useState<SerializedBookRef[]>([])
  const [characters, setCharacters] = useState<SerializedCharacterRef[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const result = await novelsApi.getList({ page: 1, pageSize: 200 })
        if (cancelled) return
        const novelList = result.data || []
        const bookRefs: SerializedBookRef[] = novelList.map(n => ({
          id: n.id,
          title: n.title,
        }))
        const charRefs: SerializedCharacterRef[] = []
        const seen = new Set<string>()
        for (const novel of novelList) {
          const list = (novel as { characters?: unknown }).characters
          if (!Array.isArray(list)) continue
          for (const raw of list as RawNovelCharacter[]) {
            if (!raw || typeof raw !== 'object') continue
            const id = typeof raw.id === 'string' ? raw.id : ''
            const name = typeof raw.name === 'string' ? raw.name : ''
            if (!id || !name || seen.has(id)) continue
            seen.add(id)
            charRefs.push({ id, name })
          }
        }
        setBooks(bookRefs)
        setCharacters(charRefs)
      } catch (err) {
        if (cancelled) return
        console.error('[useChatMentions] load failed:', err)
        setLoadError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(
    () => ({ books, characters, isLoading, loadError }),
    [books, characters, isLoading, loadError],
  )
}
