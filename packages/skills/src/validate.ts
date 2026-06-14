import type { ParsedSkillFile } from './manifest'
import { discoverCatalogSkillDirs, loadSkillsFromCatalogDirs } from './load-catalog'
import { isValidSkillName } from './manifest'
import { parseSkillFileFromDisk } from './parse-skill-disk'

export interface SkillValidationIssue {
  skillId: string
  message: string
}

export function validateParsedSkill(parsed: ParsedSkillFile): SkillValidationIssue[] {
  const issues: SkillValidationIssue[] = []
  const { frontmatter, skillDirName, filePath } = parsed

  if (!isValidSkillName(frontmatter.name)) {
    issues.push({ skillId: skillDirName, message: `${filePath}: invalid name format` })
  }
  if (frontmatter.name !== skillDirName && !skillDirName.startsWith('user-')) {
    issues.push({
      skillId: skillDirName,
      message: `${filePath}: name must match directory`,
    })
  }
  if (frontmatter.description.length > 1024) {
    issues.push({ skillId: skillDirName, message: `${filePath}: description exceeds 1024 chars` })
  }
  if (!parsed.body.trim()) {
    issues.push({ skillId: skillDirName, message: `${filePath}: body is empty` })
  }

  const trigger = frontmatter.metadata?.narraverse?.trigger
  if (trigger?.type !== 'always' && trigger?.type !== undefined) {
    if (!trigger.modes?.length && !trigger.textPattern) {
      issues.push({
        skillId: skillDirName,
        message: `${filePath}: trigger requires modes or textPattern`,
      })
    }
  }

  return issues
}

export function validateCatalogSkills(): SkillValidationIssue[] {
  const dirs = discoverCatalogSkillDirs()
  const issues: SkillValidationIssue[] = []

  for (const dir of dirs) {
    try {
      const parsed = parseSkillFileFromDisk(dir)
      issues.push(...validateParsedSkill(parsed))
    } catch (error) {
      const skillId = dir.split(/[/\\]/).pop() || dir
      issues.push({
        skillId,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  try {
    loadSkillsFromCatalogDirs(dirs)
  } catch (error) {
    issues.push({
      skillId: '*',
      message: error instanceof Error ? error.message : String(error),
    })
  }

  return issues
}
