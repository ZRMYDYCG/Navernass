import { loadBuiltinSkillsFromCatalog } from './load-catalog'
import { syncAllCatalogSkills } from './sync'
import { validateCatalogSkills } from './validate'

const command = process.argv[2] ?? 'help'
const projectRoot = process.cwd()

function printHelp() {
  console.log(`narraverse-skills — Narraverse Agent Skills CLI

Usage:
  narraverse-skills sync      Copy catalog skills to .agents/skills and .cursor/skills
  narraverse-skills validate  Validate catalog SKILL.md files
  narraverse-skills list      List builtin skill ids
  narraverse-skills help      Show this help
`)
}

function main() {
  switch (command) {
    case 'sync': {
      const result = syncAllCatalogSkills(projectRoot)
      console.log(`Synced ${result.synced.length} skills:`)
      for (const id of result.synced) console.log(`  - ${id}`)
      for (const target of result.targets) console.log(`→ ${target}`)
      break
    }
    case 'validate': {
      const issues = validateCatalogSkills()
      if (issues.length === 0) {
        console.log('✓ All catalog skills valid')
        break
      }
      console.error('Validation failed:')
      for (const issue of issues) {
        console.error(`  [${issue.skillId}] ${issue.message}`)
      }
      process.exit(1)
      break
    }
    case 'list': {
      for (const skill of loadBuiltinSkillsFromCatalog()) {
        console.log(`${skill.id}\t${skill.name}`)
      }
      break
    }
    default:
      printHelp()
  }
}

main()
