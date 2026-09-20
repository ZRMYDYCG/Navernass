import { registerTool } from '../registry'
import { proposeCharacterTool } from './propose-character'
import { proposeNovelTool } from './propose-novel'
import { proposeOutlineTool } from './propose-outline'
import { proposeSummaryTool } from './propose-summary'

export * from './propose-character'
export * from './propose-novel'
export * from './propose-outline'
export * from './propose-summary'

let registered = false
export function registerChatBridgeTools() {
  if (registered) return
  registered = true
  registerTool('propose_novel', proposeNovelTool)
  registerTool('propose_character', proposeCharacterTool)
  registerTool('propose_outline', proposeOutlineTool)
  registerTool('propose_summary', proposeSummaryTool)
}
