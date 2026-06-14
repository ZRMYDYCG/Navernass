import { syncAllCatalogSkills } from '@narraverse/skills/server'

const result = syncAllCatalogSkills(process.cwd())

console.log(`Synced ${result.synced.length} skills to editor directories:`)
for (const id of result.synced) {
  console.log(`  - ${id}`)
}
for (const target of result.targets) {
  console.log(`→ ${target}`)
}
