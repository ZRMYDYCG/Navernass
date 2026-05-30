import type { CharacterTimelineEvent } from '@/lib/supabase/sdk'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

/**
 * Character Timeline store
 *
 * 按 characterId 索引：每个角色有一个独立时间线（事件 id 数组 + byId）。
 * - 进入角色面板首次拉取后 hydrate 该角色
 * - 角色剧本 Agent 通过 AutoWriteToolPart 触发 upsert/remove
 * - 切换角色不重新拉取已 hydrate 的角色
 */

interface TimelineStoreState {
  /** 全部事件 byId（跨角色） */
  eventsById: Record<string, CharacterTimelineEvent>
  /** 每个角色的事件 id 顺序数组（按 timeline_position） */
  eventIdsByCharacter: Record<string, string[]>
  /** 已 hydrate 的角色 id 集合 */
  hydratedCharacters: Set<string>

  hydrateForCharacter: (characterId: string, events: CharacterTimelineEvent[]) => void
  resetForNovel: () => void

  upsertEvent: (event: CharacterTimelineEvent) => void
  removeEvent: (id: string) => void
}

function sortByPosition(items: CharacterTimelineEvent[]): CharacterTimelineEvent[] {
  return [...items].sort((a, b) => a.timeline_position - b.timeline_position)
}

export const useTimelineStore = create<TimelineStoreState>()(
  devtools(
    immer<TimelineStoreState>(set => ({
      eventsById: {},
      eventIdsByCharacter: {},
      hydratedCharacters: new Set<string>(),

      hydrateForCharacter: (characterId, events) => set((state) => {
        const sorted = sortByPosition(events)
        // 清掉该角色旧的索引
        const oldIds = state.eventIdsByCharacter[characterId] || []
        for (const oid of oldIds) delete state.eventsById[oid]
        state.eventIdsByCharacter[characterId] = []
        for (const e of sorted) {
          state.eventsById[e.id] = e
          state.eventIdsByCharacter[characterId].push(e.id)
        }
        state.hydratedCharacters.add(characterId)
      }),

      resetForNovel: () => set((state) => {
        state.eventsById = {}
        state.eventIdsByCharacter = {}
        state.hydratedCharacters = new Set()
      }),

      upsertEvent: event => set((state) => {
        const existing = state.eventsById[event.id]
        state.eventsById[event.id] = event
        const ids = state.eventIdsByCharacter[event.character_id] || []
        if (!existing) {
          ids.push(event.id)
        }
        // 重新排序
        ids.sort((a, b) => {
          const ea = state.eventsById[a]?.timeline_position ?? 0
          const eb = state.eventsById[b]?.timeline_position ?? 0
          return ea - eb
        })
        state.eventIdsByCharacter[event.character_id] = ids
      }),

      removeEvent: id => set((state) => {
        const event = state.eventsById[id]
        if (!event) return
        delete state.eventsById[id]
        const cid = event.character_id
        if (state.eventIdsByCharacter[cid]) {
          state.eventIdsByCharacter[cid] = state.eventIdsByCharacter[cid].filter(x => x !== id)
        }
      }),
    })),
    { name: 'timelineStore' },
  ),
)

/** 选择器：某角色的事件按顺序 */
export function selectEventsForCharacter(characterId: string) {
  return (state: TimelineStoreState) => {
    const ids = state.eventIdsByCharacter[characterId] || []
    return ids.map(id => state.eventsById[id]).filter(Boolean)
  }
}
