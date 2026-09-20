import type { ChaptersState } from './chapters.types'

export const chaptersInitialState: ChaptersState = {
  currentNovelId: null,
  chaptersById: {},
  chapterIdsOrdered: [],
  volumesById: {},
  volumeIdsOrdered: [],
  hydrated: false,
}
