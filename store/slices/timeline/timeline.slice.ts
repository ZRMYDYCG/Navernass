import type { StoreSlice } from '../../store.types'
import { createTimelineActions } from './timeline.actions'
import { timelineInitialState } from './timeline.initial-state'
import type { TimelineSlice } from './timeline.types'

export const createTimelineSlice: StoreSlice<TimelineSlice> = (set, get) => ({
  timeline: timelineInitialState,
  timelineActions: createTimelineActions(set, get),
})
