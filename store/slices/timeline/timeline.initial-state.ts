import type { TimelineState } from './timeline.types'

export const timelineInitialState: TimelineState = {
  eventsById: {},
  eventIdsByCharacter: {},
  hydratedCharacters: new Set<string>(),
}
