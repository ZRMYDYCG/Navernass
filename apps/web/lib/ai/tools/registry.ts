import type { ToolBuilder, ToolContext } from '../agents/types'

/**
 * Tools 注册表
 *
 * 工具按 name 注册 builder，agent 装配时根据 skill / agent 的 toolNames
 * 拿到对应 builder 并用运行时 ToolContext 实例化。
 */
const toolBuilders = new Map<string, ToolBuilder>()

export function registerTool(name: string, builder: ToolBuilder) {
  if (toolBuilders.has(name)) {
    throw new Error(`Tool already registered: ${name}`)
  }
  toolBuilders.set(name, builder)
}

export function buildTools(names: string[], ctx: ToolContext) {
  const out: Record<string, ReturnType<ToolBuilder>> = {}
  for (const name of names) {
    const builder = toolBuilders.get(name)
    if (!builder) {
      console.warn(`[tools] Unknown tool name: ${name}`)
      continue
    }
    out[name] = builder(ctx)
  }
  return out
}

export function listToolNames(): string[] {
  return Array.from(toolBuilders.keys())
}
