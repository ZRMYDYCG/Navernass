import { validateCatalogSkills, discoverCatalogSkillDirs } from '@narraverse/skills/server'

const dirs = discoverCatalogSkillDirs()
const issues = validateCatalogSkills()

if (issues.length === 0) {
  console.log(`✓ ${dirs.length} skills validated`)
  process.exit(0)
}

console.error('Skill validation failed:')
for (const issue of issues) {
  console.error(`  [${issue.skillId}] ${issue.message}`)
}
process.exit(1)
