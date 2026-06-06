import type { WorldviewState } from './worldview.types'

export const worldviewInitialState: WorldviewState = {
  currentNovelId: null,
  worldbookById: {},
  worldbookIdsOrdered: [],
  worldbookHydrated: false,
  outlinesById: {},
  outlineIdsOrdered: [],
  outlinesHydrated: false,
}
