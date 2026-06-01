import { registerBuiltinSkills } from '../skills'
import { registerBuiltinTools } from '../tools'
import { registerCharacterImportAnalyzerAgent } from './character-import-analyzer'
import { registerCharacterScriptwriterAgent } from './character-scriptwriter'
import { registerNovelSpecialistAgents } from './novel-specialists'
import { registerSelectionEditorAgent } from './selection-editor'
import { registerWriterAgent } from './writer'

export * from './character-import-analyzer'
export * from './character-scriptwriter'
export * from './novel-specialists'
export * from './selection-editor'
export * from './modes'
export * from './registry'
export * from './router'
export * from './run-routed'
export * from './run-specialist'
export * from './mode-hints'
export * from './subagents/character-timeline'
export * from './subagents/create-streaming-subagent-tool'
export * from './subagents/deep-research'
export * from './subagents/types'
export * from './subagents/writer-subagent-tools'
export * from './types'
export { runWriterAgent, writerAgent } from './writer'

/**
 * 启动时一次性注册所有内置组件。
 * 在 stream/route.ts 顶层调用即可。
 */
let bootstrapped = false
export function bootstrapAgents() {
  if (bootstrapped) return
  bootstrapped = true
  registerBuiltinTools()
  registerBuiltinSkills()
  registerNovelSpecialistAgents()
  registerWriterAgent()
  registerCharacterScriptwriterAgent()
  registerCharacterImportAnalyzerAgent()
  registerSelectionEditorAgent()
}
