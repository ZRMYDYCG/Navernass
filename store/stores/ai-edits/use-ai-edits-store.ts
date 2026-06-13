import { createBoundStore } from '../../create-store'
import { createAiEditsActions } from './ai-edits.actions'
import { aiEditsInitialState } from './ai-edits.initial-state'
import type { AiEditsStore } from './ai-edits.types'

export const useAiEditsStore = createBoundStore<AiEditsStore>('ai-edits-store', (set, get) => ({
  aiEdits: aiEditsInitialState,
  aiEditsActions: createAiEditsActions(set, get),
}))
