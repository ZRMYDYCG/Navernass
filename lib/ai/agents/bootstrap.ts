import 'server-only'

import { registerBuiltinSkills } from '../skills'
import { registerBuiltinTools } from '../tools'
import { registerChatBridgeTools } from '../tools/chat-bridge'
import { registerCharacterImportAnalyzerAgent } from './character-import-analyzer'
import { registerCharacterScriptwriterAgent } from './character-scriptwriter'
import { registerChatSpecialistAgents } from './chat-specialists'
import { registerNovelSpecialistAgents } from './novel-specialists'
import { registerSelectionEditorAgent } from './selection-editor'
import { registerWriterAgent } from './writer'

let bootstrapped = false

/** 启动时一次性注册所有内置组件。在 stream/route.ts 顶层调用即可。 */
export function bootstrapAgents() {
  if (bootstrapped) return
  bootstrapped = true
  registerBuiltinTools()
  registerChatBridgeTools()
  registerBuiltinSkills()
  registerNovelSpecialistAgents()
  registerChatSpecialistAgents()
  registerWriterAgent()
  registerCharacterScriptwriterAgent()
  registerCharacterImportAnalyzerAgent()
  registerSelectionEditorAgent()
}
