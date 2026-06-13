import { createBoundStore } from '../../create-store'
import { createTimelineActions } from './timeline.actions'
import { timelineInitialState } from './timeline.initial-state'
import type { TimelineStore } from './timeline.types'

export const useTimelineStore = createBoundStore<TimelineStore>('timeline-store', (set, get) => ({
  timeline: timelineInitialState,
  timelineActions: createTimelineActions(set, get),
}))
