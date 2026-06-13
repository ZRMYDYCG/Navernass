import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const CATALOG_PARTS = ['skills', 'catalog'] as const

function hasCatalogAtPackageRoot(root: string): boolean {
  return existsSync(join(root, ...CATALOG_PARTS))
}

function resolvePackageRoot(): string {
  const tried: string[] = []

  // pnpm/npm workspace — reliable when Next/Turbopack bundles the package
  try {
    const require = createRequire(join(process.cwd(), 'package.json'))
    const packageRoot = dirname(require.resolve('@narraverse/skills/package.json'))
    tried.push(join(packageRoot, ...CATALOG_PARTS))
    if (hasCatalogAtPackageRoot(packageRoot)) return packageRoot
  } catch {
    // ignore
  }

  // Monorepo: cwd is app root
  const monorepoPackageRoot = join(process.cwd(), 'packages', 'skills')
  tried.push(join(monorepoPackageRoot, ...CATALOG_PARTS))
  if (hasCatalogAtPackageRoot(monorepoPackageRoot)) return monorepoPackageRoot

  // tsx CLI: import.meta.url points at source files
  try {
    const fromImportMeta = join(dirname(fileURLToPath(import.meta.url)), '..')
    tried.push(join(fromImportMeta, ...CATALOG_PARTS))
    if (hasCatalogAtPackageRoot(fromImportMeta)) return fromImportMeta
  } catch {
    // ignore
  }

  throw new Error(`Skills catalog not found. Tried:\n${tried.join('\n')}`)
}

let cachedCatalogDir: string | null = null

export function getSkillsCatalogDir(): string {
  if (!cachedCatalogDir) {
    cachedCatalogDir = join(resolvePackageRoot(), ...CATALOG_PARTS)
  }
  return cachedCatalogDir
}

export function resolveSkillDir(skillId: string) {
  return join(getSkillsCatalogDir(), skillId)
}
