/** Narraverse runtime extensions to the Agent Skills open standard */

export type SkillTriggerType =
  | 'always'
  | 'mode-only'
  | 'mode-or-text'
  | 'mode-and-text'

export interface NarraverseSkillTrigger {
  type: SkillTriggerType
  modes?: string[]
  textPattern?: string
  textFlags?: string
}

export interface NarraverseSkillMetadata {
  displayName: string
  scope?: 'runtime' | 'editor' | 'both'
  license?: 'official' | 'community' | 'user'
  tools?: string[]
  compatibleModes?: string[]
  trigger?: NarraverseSkillTrigger
}

export interface SkillManifestFrontmatter {
  name: string
  description: string
  license?: string
  compatibility?: string
  metadata?: {
    author?: string
    version?: string
    narraverse?: NarraverseSkillMetadata
    [key: string]: unknown
  }
}

export interface ParsedSkillFile {
  frontmatter: SkillManifestFrontmatter
  body: string
  skillDirName: string
  filePath: string
}

export interface RuntimeSkill {
  id: string
  name: string
  description: string
  systemPrompt: string
  toolNames?: string[]
  triggers?: (input: { text: string, mode: string }) => boolean
  compatibleModes?: string[]
  isUserSkill?: boolean
  license?: 'official' | 'community' | 'user'
  scope?: 'runtime' | 'editor' | 'both'
}

export const BUILTIN_SKILL_IDS = [
  'chinese-novel-style',
  'brainstorm-facilitation',
  'craft-discussion',
  'editor-surgical',
  'outline-editing',
  'polish-translate',
  'story-planning',
  'worldbook-editing',
] as const

export type BuiltinSkillId = (typeof BUILTIN_SKILL_IDS)[number]

export const SKILL_CATEGORIES = [
  'writing-style',
  'planning',
  'editing',
  'brainstorm',
  'craft',
  'worldbuilding',
] as const

export type SkillCategory = (typeof SKILL_CATEGORIES)[number]

const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSkillName(name: string): boolean {
  if (!name || name.length > 64) return false
  if (name.startsWith('-') || name.endsWith('-')) return false
  if (name.includes('--')) return false
  return SKILL_NAME_PATTERN.test(name)
}

export function getSkillCategory(skillId: BuiltinSkillId): SkillCategory {
  const map: Record<BuiltinSkillId, SkillCategory> = {
    'chinese-novel-style': 'writing-style',
    'brainstorm-facilitation': 'brainstorm',
    'craft-discussion': 'craft',
    'editor-surgical': 'editing',
    'outline-editing': 'planning',
    'polish-translate': 'editing',
    'story-planning': 'planning',
    'worldbook-editing': 'worldbuilding',
  }
  return map[skillId]
}
