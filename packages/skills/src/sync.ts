import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { discoverCatalogSkillDirs } from './load-catalog'
import { parseSkillFileFromDisk } from './parse-skill-md'
import { getSkillsCatalogDir } from './paths'

export interface SyncSkillsResult {
  synced: string[]
  skipped: string[]
  targets: string[]
}

function resolveTargetDirs(projectRoot: string) {
  return [
    join(projectRoot, '.agents', 'skills'),
    join(projectRoot, '.cursor', 'skills'),
  ]
}

/** 同步全部 catalog skill 到 .agents/skills 与 .cursor/skills */
export function syncAllCatalogSkills(projectRoot: string): SyncSkillsResult {
  const skillDirs = discoverCatalogSkillDirs()
  const synced: string[] = []
  const targetRoots = resolveTargetDirs(projectRoot)

  for (const targetRoot of targetRoots) {
    mkdirSync(targetRoot, { recursive: true })
  }

  for (const skillDir of skillDirs) {
    const parsed = parseSkillFileFromDisk(skillDir)
    const skillName = parsed.frontmatter.name

    for (const targetRoot of targetRoots) {
      const destDir = join(targetRoot, skillName)
      if (existsSync(destDir)) {
        rmSync(destDir, { recursive: true, force: true })
      }
      cpSync(skillDir, destDir, { recursive: true })
    }
    synced.push(skillName)
  }

  return { synced, skipped: [], targets: targetRoots }
}

export function getDefaultCatalogDir() {
  return getSkillsCatalogDir()
}
