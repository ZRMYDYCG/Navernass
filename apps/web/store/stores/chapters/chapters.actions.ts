import type { Chapter, Volume } from '@/lib/supabase/sdk'
import { removeIdFromArray } from '../../utils'
import type { StoreGet, StoreSet } from '../../store.types'
import type { ChaptersStore } from './chapters.types'
import type { ChaptersActions } from './chapters.types'

function sortByOrderIndex<T extends { order_index: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order_index - b.order_index)
}

export function createChaptersActions(set: StoreSet<ChaptersStore>, _get: StoreGet<ChaptersStore>): ChaptersActions {
  return {
    hydrate: (novelId, chapters, volumes) => {
      set((state) => {
        state.chapters.currentNovelId = novelId
        state.chapters.chaptersById = {}
        state.chapters.chapterIdsOrdered = []
        state.chapters.volumesById = {}
        state.chapters.volumeIdsOrdered = []

        for (const ch of sortByOrderIndex(chapters)) {
          state.chapters.chaptersById[ch.id] = ch
          state.chapters.chapterIdsOrdered.push(ch.id)
        }
        for (const v of sortByOrderIndex(volumes)) {
          state.chapters.volumesById[v.id] = v
          state.chapters.volumeIdsOrdered.push(v.id)
        }

        state.chapters.hydrated = true
      }, false, 'chapters/hydrate')
    },

    reset: () => {
      set((state) => {
        state.chapters.currentNovelId = null
        state.chapters.chaptersById = {}
        state.chapters.chapterIdsOrdered = []
        state.chapters.volumesById = {}
        state.chapters.volumeIdsOrdered = []
        state.chapters.hydrated = false
      }, false, 'chapters/reset')
    },

    upsertChapter: (chapter) => {
      set((state) => {
        if (state.chapters.currentNovelId && chapter.novel_id !== state.chapters.currentNovelId) return
        const exists = state.chapters.chaptersById[chapter.id]
        state.chapters.chaptersById[chapter.id] = chapter
        if (!exists) {
          state.chapters.chapterIdsOrdered.push(chapter.id)
          state.chapters.chapterIdsOrdered.sort((a, b) => {
            const oa = state.chapters.chaptersById[a]?.order_index ?? 0
            const ob = state.chapters.chaptersById[b]?.order_index ?? 0
            return oa - ob
          })
        }
      }, false, 'chapters/upsertChapter')
    },

    removeChapter: (chapterId) => {
      set((state) => {
        delete state.chapters.chaptersById[chapterId]
        removeIdFromArray(state.chapters.chapterIdsOrdered, chapterId)
      }, false, 'chapters/removeChapter')
    },

    setChapters: (chapters: Chapter[]) => {
      set((state) => {
        state.chapters.chaptersById = {}
        state.chapters.chapterIdsOrdered = []
        for (const ch of sortByOrderIndex(chapters)) {
          state.chapters.chaptersById[ch.id] = ch
          state.chapters.chapterIdsOrdered.push(ch.id)
        }
      }, false, 'chapters/setChapters')
    },

    upsertVolume: (volume: Volume) => {
      set((state) => {
        if (state.chapters.currentNovelId && volume.novel_id !== state.chapters.currentNovelId) return
        const exists = state.chapters.volumesById[volume.id]
        state.chapters.volumesById[volume.id] = volume
        if (!exists) {
          state.chapters.volumeIdsOrdered.push(volume.id)
          state.chapters.volumeIdsOrdered.sort((a, b) => {
            const oa = state.chapters.volumesById[a]?.order_index ?? 0
            const ob = state.chapters.volumesById[b]?.order_index ?? 0
            return oa - ob
          })
        }
      }, false, 'chapters/upsertVolume')
    },

    removeVolume: (volumeId) => {
      set((state) => {
        delete state.chapters.volumesById[volumeId]
        removeIdFromArray(state.chapters.volumeIdsOrdered, volumeId)
      }, false, 'chapters/removeVolume')
    },

    setVolumes: (volumes: Volume[]) => {
      set((state) => {
        state.chapters.volumesById = {}
        state.chapters.volumeIdsOrdered = []
        for (const v of sortByOrderIndex(volumes)) {
          state.chapters.volumesById[v.id] = v
          state.chapters.volumeIdsOrdered.push(v.id)
        }
      }, false, 'chapters/setVolumes')
    },
  }
}
