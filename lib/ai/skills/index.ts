import { brainstormFacilitationSkill } from './brainstorm-facilitation'
import { chineseNovelStyleSkill } from './chinese-novel-style'
import { craftDiscussionSkill } from './craft-discussion'
import { editorSurgicalSkill } from './editor-surgical'
import { outlineEditingSkill } from './outline-editing'
import { polishTranslateSkill } from './polish-translate'
import { storyPlanningSkill } from './story-planning'
import { registerSkill } from './types'
import { worldbookEditingSkill } from './worldbook-editing'

export * from './types'
export {
  brainstormFacilitationSkill,
  chineseNovelStyleSkill,
  craftDiscussionSkill,
  editorSurgicalSkill,
  outlineEditingSkill,
  polishTranslateSkill,
  storyPlanningSkill,
  worldbookEditingSkill,
}

/** 注册所有内置 skill。stream/route.ts 启动时调用一次。 */
let registered = false
export function registerBuiltinSkills() {
  if (registered) return
  registered = true
  registerSkill(chineseNovelStyleSkill)
  registerSkill(editorSurgicalSkill)
  registerSkill(storyPlanningSkill)
  registerSkill(outlineEditingSkill)
  registerSkill(worldbookEditingSkill)
  registerSkill(brainstormFacilitationSkill)
  registerSkill(craftDiscussionSkill)
  registerSkill(polishTranslateSkill)
}
