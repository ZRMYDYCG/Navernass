import type { CharacterTimelineEvent } from '@/lib/supabase/sdk'
import { removeIdFromArray } from '../../utils'
import type { StoreGet, StoreSet } from '../../store.types'
import type { TimelineStore } from './timeline.types'
import type { TimelineActions } from './timeline.types'

function sortByPosition(items: CharacterTimelineEvent[]): CharacterTimelineEvent[] {
  return [...items].sort((a, b) => a.timeline_position - b.timeline_position)
}

export function createTimelineActions(set: StoreSet<TimelineStore>, _get: StoreGet<TimelineStore>): TimelineActions {
  return {
    hydrateForCharacter: (characterId, events) => {
      set((state) => {
        const sorted = sortByPosition(events)
        const oldIds = state.timeline.eventIdsByCharacter[characterId]
        if (oldIds) {
          for (const oid of oldIds) delete state.timeline.eventsById[oid]
          oldIds.length = 0
        } else {
          state.timeline.eventIdsByCharacter[characterId] = []
        }
        const ids = state.timeline.eventIdsByCharacter[characterId]
        for (const e of sorted) {
          state.timeline.eventsById[e.id] = e
          ids.push(e.id)
        }
        state.timeline.hydratedCharacters.add(characterId)
      }, false, 'timeline/hydrateForCharacter')
    },

    resetForNovel: () => {
      set((state) => {
        state.timeline.eventsById = {}
        state.timeline.eventIdsByCharacter = {}
        state.timeline.hydratedCharacters = new Set<string>()
      }, false, 'timeline/resetForNovel')
    },

    upsertEvent: (event) => {
      set((state) => {
        const existing = state.timeline.eventsById[event.id]
        state.timeline.eventsById[event.id] = event
        if (!state.timeline.eventIdsByCharacter[event.character_id]) {
          state.timeline.eventIdsByCharacter[event.character_id] = []
        }
        const ids = state.timeline.eventIdsByCharacter[event.character_id]
        if (!existing) ids.push(event.id)
        ids.sort((a, b) => {
          const ea = state.timeline.eventsById[a]?.timeline_position ?? 0
          const eb = state.timeline.eventsById[b]?.timeline_position ?? 0
          return ea - eb
        })
      }, false, 'timeline/upsertEvent')
    },

    removeEvent: (id) => {
      set((state) => {
        const event = state.timeline.eventsById[id]
        if (!event) return
        delete state.timeline.eventsById[id]
        const ids = state.timeline.eventIdsByCharacter[event.character_id]
        if (ids) removeIdFromArray(ids, id)
      }, false, 'timeline/removeEvent')
    },
  }
}
