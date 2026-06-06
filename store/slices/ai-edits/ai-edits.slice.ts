import type { StoreSlice } from '../../store.types'
import { createAiEditsActions } from './ai-edits.actions'
import { aiEditsInitialState } from './ai-edits.initial-state'
import type { AiEditsSlice } from './ai-edits.types'

export const createAiEditsSlice: StoreSlice<AiEditsSlice> = (set, get) => ({
  aiEdits: aiEditsInitialState,
  aiEditsActions: createAiEditsActions(set, get),
})
