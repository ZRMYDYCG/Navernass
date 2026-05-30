import { registerBuiltinSkills } from '../skills'
import { registerBuiltinTools } from '../tools'
import { registerWriterAgent } from './writer'

export * from './registry'
export * from './router'
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
  registerWriterAgent()
}
