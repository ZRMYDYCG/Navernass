import type { Outline, WorldbookEntry } from '@/lib/supabase/sdk'
import type { WorldviewStore } from './worldview.types'

export const selectWorldview = (state: WorldviewStore) => state.worldview
export const selectWorldviewCurrentNovelId = (state: WorldviewStore) => state.worldview.currentNovelId
export const selectWorldbookHydrated = (state: WorldviewStore) => state.worldview.worldbookHydrated
export const selectOutlinesHydrated = (state: WorldviewStore) => state.worldview.outlinesHydrated
export const selectWorldbookEntryById = (id: string) => (state: WorldviewStore): WorldbookEntry | undefined =>
  state.worldview.worldbookById[id]
export const selectOutlineById = (id: string) => (state: WorldviewStore): Outline | undefined =>
  state.worldview.outlinesById[id]

/** 选择器：按顺序拿到世界观条目 */
export function selectOrderedWorldbookEntries(state: WorldviewStore): WorldbookEntry[] {
  return state.worldview.worldbookIdsOrdered
    .map(id => state.worldview.worldbookById[id])
    .filter(Boolean)
}

/** 选择器：按顺序拿到大纲节点（扁平） */
export function selectOrderedOutlines(state: WorldviewStore): Outline[] {
  return state.worldview.outlineIdsOrdered
    .map(id => state.worldview.outlinesById[id])
    .filter(Boolean)
}
