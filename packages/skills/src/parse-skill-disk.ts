import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseSkillMarkdown, type ParsedSkillFile } from './parse-skill-md'

export function parseSkillFileFromDisk(skillDir: string): ParsedSkillFile {
  const filePath = join(skillDir, 'SKILL.md')
  const raw = readFileSync(filePath, 'utf8')
  const skillDirName = skillDir.split(/[/\\]/).pop() || ''
  return parseSkillMarkdown(raw, skillDirName, filePath)
}
