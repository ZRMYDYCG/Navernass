import { chineseNovelStyleSkill } from './chinese-novel-style'
import { editorSurgicalSkill } from './editor-surgical'
import { registerSkill } from './types'

export * from './types'
export { chineseNovelStyleSkill, editorSurgicalSkill }

/** 注册所有内置 skill。stream/route.ts 启动时调用一次。 */
let registered = false
export function registerBuiltinSkills() {
  if (registered) return
  registered = true
  registerSkill(chineseNovelStyleSkill)
  registerSkill(editorSurgicalSkill)
}
