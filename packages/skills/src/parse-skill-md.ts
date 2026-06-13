import type {
  NarraverseSkillTrigger,
  ParsedSkillFile,
  RuntimeSkill,
  SkillManifestFrontmatter,
} from './manifest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { isValidSkillName } from './manifest'

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/

export function splitSkillMarkdown(raw: string): { frontmatter: string, body: string } {
  const match = raw.match(FRONTMATTER_RE)
  if (!match) {
    throw new Error('SKILL.md must start with YAML frontmatter delimited by ---')
  }
  return { frontmatter: match[1], body: match[2].trim() }
}

export function parseSkillMarkdown(
  raw: string,
  skillDirName: string,
  filePath: string,
  options?: { skipDirNameCheck?: boolean },
): ParsedSkillFile {
  const { frontmatter, body } = splitSkillMarkdown(raw)
  const parsed = parseYaml(frontmatter) as SkillManifestFrontmatter | null

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`${filePath}: invalid YAML frontmatter`)
  }
  if (!parsed.name || parsed.description == null || parsed.description === '') {
    throw new Error(`${filePath}: frontmatter requires name and description`)
  }
  const description = String(parsed.description).trim()
  if (!isValidSkillName(parsed.name)) {
    throw new Error(`${filePath}: invalid skill name "${parsed.name}"`)
  }
  if (
    !options?.skipDirNameCheck
    && parsed.name !== skillDirName
    && !skillDirName.startsWith('user-')
  ) {
    throw new Error(`${filePath}: name "${parsed.name}" must match directory "${skillDirName}"`)
  }
  if (!description) {
    throw new Error(`${filePath}: description must be non-empty`)
  }

  return {
    frontmatter: { ...parsed, description },
    body,
    skillDirName,
    filePath,
  }
}

export function parseSkillFileFromDisk(skillDir: string): ParsedSkillFile {
  const filePath = join(skillDir, 'SKILL.md')
  const raw = readFileSync(filePath, 'utf8')
  const skillDirName = skillDir.split(/[/\\]/).pop() || ''
  return parseSkillMarkdown(raw, skillDirName, filePath)
}

export function parseSkillMarkdownFromString(raw: string, skillDirName?: string): ParsedSkillFile {
  const label = skillDirName || 'custom-skill'
  const parsed = parseSkillMarkdown(raw, label, label, { skipDirNameCheck: true })
  return {
    ...parsed,
    skillDirName: parsed.frontmatter.name,
    filePath: parsed.frontmatter.name,
  }
}

function buildTriggerFn(trigger?: NarraverseSkillTrigger): RuntimeSkill['triggers'] {
  if (!trigger || trigger.type === 'always') return undefined

  const modes = trigger.modes ?? []
  const textPattern = trigger.textPattern
    ? new RegExp(trigger.textPattern, trigger.textFlags ?? 'i')
    : null

  switch (trigger.type) {
    case 'mode-only':
      return ({ mode }) => modes.includes(mode)

    case 'mode-or-text':
      return ({ text, mode }) => {
        if (modes.includes(mode)) return true
        return textPattern ? textPattern.test(text) : false
      }

    case 'mode-and-text':
      return ({ text, mode }) => {
        if (modes.length > 0 && !modes.includes(mode)) return false
        return textPattern ? textPattern.test(text) : true
      }

    default:
      return undefined
  }
}

export function toRuntimeSkill(parsed: ParsedSkillFile, options?: { id?: string, isUserSkill?: boolean }): RuntimeSkill {
  const nv = parsed.frontmatter.metadata?.narraverse
  const displayName = nv?.displayName ?? parsed.frontmatter.name

  return {
    id: options?.id ?? parsed.frontmatter.name,
    name: displayName,
    description: parsed.frontmatter.description.trim(),
    systemPrompt: parsed.body,
    toolNames: nv?.tools?.length ? nv.tools : undefined,
    triggers: buildTriggerFn(nv?.trigger),
    compatibleModes: nv?.compatibleModes,
    isUserSkill: options?.isUserSkill ?? nv?.license === 'user',
    license: nv?.license ?? 'official',
    scope: nv?.scope ?? 'runtime',
  }
}

export function parseSkillMarkdownToRuntime(raw: string, skillDirName: string, options?: { id?: string, isUserSkill?: boolean }): RuntimeSkill {
  return toRuntimeSkill(parseSkillMarkdown(raw, skillDirName, skillDirName), options)
}
