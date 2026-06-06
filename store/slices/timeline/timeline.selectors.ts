import type { CharacterTimelineEvent } from '@/lib/supabase/sdk'
import type { AppStore } from '../../store.types'

export const selectTimeline = (state: AppStore) => state.timeline
export const selectHydratedCharacters = (state: AppStore) => state.timeline.hydratedCharacters
export const selectEventById = (id: string) => (state: AppStore): CharacterTimelineEvent | undefined =>
  state.timeline.eventsById[id]

/** 选择器：某角色的事件按顺序 */
export function selectEventsForCharacter(characterId: string) {
  return (state: AppStore): CharacterTimelineEvent[] => {
    const ids = state.timeline.eventIdsByCharacter[characterId] || []
    return ids.map(id => state.timeline.eventsById[id]).filter(Boolean)
  }
}
