import type { StoreSlice } from '../../store.types'
import { createChaptersActions } from './chapters.actions'
import { chaptersInitialState } from './chapters.initial-state'
import type { ChaptersSlice } from './chapters.types'

export const createChaptersSlice: StoreSlice<ChaptersSlice> = (set, get) => ({
  chapters: chaptersInitialState,
  chaptersActions: createChaptersActions(set, get),
})
