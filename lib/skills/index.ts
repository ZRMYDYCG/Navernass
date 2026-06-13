export type {
  BuiltinSkillId,
  NarraverseSkillMetadata,
  NarraverseSkillTrigger,
  ParsedSkillFile,
  RuntimeSkill,
  SkillCategory,
  SkillManifestFrontmatter,
  SkillTriggerType,
  SkillValidationIssue,
} from '@narraverse/skills'

export {
  BUILTIN_SKILL_IDS,
  SKILL_CATEGORIES,
  discoverCatalogSkillDirs,
  getDefaultCatalogDir,
  getSkillCategory,
  getSkillsCatalogDir,
  isValidSkillName,
  listCatalogSkillSummaries,
  loadBuiltinSkillsFromCatalog,
  loadSkillsFromCatalogDirs,
  parseSkillFileFromDisk,
  parseSkillMarkdown,
  parseSkillMarkdownFromString,
  parseSkillMarkdownToRuntime,
  resetCatalogSkillCache,
  splitSkillMarkdown,
  syncAllCatalogSkills,
  toRuntimeSkill,
  validateCatalogSkills,
  validateParsedSkill,
} from '@narraverse/skills'

import type { RuntimeSkill } from '@narraverse/skills'
import type { Skill } from '@/lib/ai/agents/types'

export function toAppSkill(skill: RuntimeSkill): Skill {
  return skill
}

export function toAppSkills(skills: RuntimeSkill[]): Skill[] {
  return skills
}
