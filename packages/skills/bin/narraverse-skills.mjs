#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const cliPath = join(packageRoot, 'src', 'cli.ts')
const args = process.argv.slice(2)

const result = spawnSync('pnpm', ['exec', 'tsx', cliPath, ...args], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd(),
})

process.exit(result.status ?? 1)
