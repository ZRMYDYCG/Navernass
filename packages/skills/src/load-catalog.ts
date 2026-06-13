import type { RuntimeSkill } from './manifest'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { BUILTIN_SKILL_IDS } from './manifest'
import { parseSkillFileFromDisk, toRuntimeSkill } from './parse-skill-md'
import { getSkillsCatalogDir } from './paths'

let cachedBuiltinSkills: RuntimeSkill[] | null = null

export function loadBuiltinSkillsFromCatalog(): RuntimeSkill[] {
  if (cachedBuiltinSkills) return cachedBuiltinSkills

  const catalogDir = getSkillsCatalogDir()
  if (!existsSync(catalogDir)) {
    throw new Error(`Skills catalog not found: ${catalogDir}`)
  }

  const skills: RuntimeSkill[] = []

  for (const skillId of BUILTIN_SKILL_IDS) {
    const skillDir = join(catalogDir, skillId)
    const skillPath = join(skillDir, 'SKILL.md')
    if (!existsSync(skillPath)) {
      throw new Error(`Missing builtin skill: ${skillPath}`)
    }
    skills.push(toRuntimeSkill(parseSkillFileFromDisk(skillDir)))
  }

  cachedBuiltinSkills = skills
  return skills
}

export function discoverCatalogSkillDirs(): string[] {
  const catalogDir = getSkillsCatalogDir()
  if (!existsSync(catalogDir)) return []
  return readdirSync(catalogDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => join(catalogDir, entry.name))
    .filter(dir => existsSync(join(dir, 'SKILL.md')))
}

export function loadSkillsFromCatalogDirs(dirs: string[]): RuntimeSkill[] {
  return dirs.map(dir => toRuntimeSkill(parseSkillFileFromDisk(dir)))
}

export function resetCatalogSkillCache() {
  cachedBuiltinSkills = null
}

export function listCatalogSkillSummaries() {
  return loadBuiltinSkillsFromCatalog().map(skill => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    license: skill.license ?? 'official',
    scope: skill.scope ?? 'runtime',
  }))
}
