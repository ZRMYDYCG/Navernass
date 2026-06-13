import { registerSkill } from './types'
import { loadBuiltinSkillsFromCatalog, toAppSkill } from '@/lib/skills'

export * from './types'

/** 从 @narraverse/skills catalog 加载并注册所有内置 skill。stream/route.ts 启动时调用一次。 */
let registered = false
export function registerBuiltinSkills() {
  if (registered) return
  registered = true

  for (const skill of loadBuiltinSkillsFromCatalog()) {
    registerSkill(toAppSkill(skill))
  }
}