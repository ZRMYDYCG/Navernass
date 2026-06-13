import { createBoundStore } from '../../create-store'
import { createChaptersActions } from './chapters.actions'
import { chaptersInitialState } from './chapters.initial-state'
import type { ChaptersStore } from './chapters.types'

export const useChaptersStore = createBoundStore<ChaptersStore>('chapters-store', (set, get) => ({
  chapters: chaptersInitialState,
  chaptersActions: createChaptersActions(set, get),
}))
