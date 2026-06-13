import type { CharacterTimelineEvent } from '@/lib/supabase/sdk'
import type { TimelineStore } from './timeline.types'

export const selectTimeline = (state: TimelineStore) => state.timeline
export const selectHydratedCharacters = (state: TimelineStore) => state.timeline.hydratedCharacters
export const selectEventById = (id: string) => (state: TimelineStore): CharacterTimelineEvent | undefined =>
  state.timeline.eventsById[id]

/** 选择器：某角色的事件按顺序 */
export function selectEventsForCharacter(characterId: string) {
  return (state: TimelineStore): CharacterTimelineEvent[] => {
    const ids = state.timeline.eventIdsByCharacter[characterId] || []
    return ids.map(id => state.timeline.eventsById[id]).filter(Boolean)
  }
}
