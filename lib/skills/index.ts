export type {
  BuiltinSkillId,
  NarraverseSkillMetadata,
  NarraverseSkillTrigger,
  ParsedSkillFile,
  RuntimeSkill,
  SkillCategory,
  SkillManifestFrontmatter,
  SkillTriggerType,
} from '@narraverse/skills'

export {
  BUILTIN_SKILL_IDS,
  SKILL_CATEGORIES,
  getSkillCategory,
  isValidSkillName,
  parseSkillMarkdown,
  parseSkillMarkdownFromString,
  parseSkillMarkdownToRuntime,
  splitSkillMarkdown,
  toRuntimeSkill,
} from '@narraverse/skills'

export type { SkillMarketplaceItem, UserCustomSkillRow } from './types'

import type { RuntimeSkill } from '@narraverse/skills'
import type { Skill } from '@/lib/ai/agents/types'

export function toAppSkill(skill: RuntimeSkill): Skill {
  return skill
}

export function toAppSkills(skills: RuntimeSkill[]): Skill[] {
  return skills
}
