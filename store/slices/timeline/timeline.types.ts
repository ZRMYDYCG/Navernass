import type { CharacterTimelineEvent } from '@/lib/supabase/sdk'

/**
 * 角色时间线：按 characterId 索引。
 * - 每个角色有独立时间线（事件 id 数组 + byId）
 * - 进入角色面板首次拉取后 hydrate 该角色
 * - 角色剧本 Agent 通过 AutoWriteToolPart 触发 upsert/remove
 * - 切换角色不重新拉取已 hydrate 的角色
 */
export type TimelineState = {
  /** 全部事件 byId（跨角色） */
  eventsById: Record<string, CharacterTimelineEvent>
  /** 每个角色的事件 id 顺序数组（按 timeline_position） */
  eventIdsByCharacter: Record<string, string[]>
  /** 已 hydrate 的角色 id 集合 */
  hydratedCharacters: Set<string>
}

export type TimelineActions = {
  hydrateForCharacter: (characterId: string, events: CharacterTimelineEvent[]) => void
  resetForNovel: () => void
  upsertEvent: (event: CharacterTimelineEvent) => void
  removeEvent: (id: string) => void
}

export type TimelineSlice = {
  timeline: TimelineState
  timelineActions: TimelineActions
}
