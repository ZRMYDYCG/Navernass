import type { AiEditsState } from './ai-edits.types'

export const aiEditsInitialState: AiEditsState = {
  edits: {},
  focusEditId: null,
  focusRequestSeq: 0,
}
