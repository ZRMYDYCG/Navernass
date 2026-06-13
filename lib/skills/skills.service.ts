import type { Skill } from '@/lib/ai/agents/types'
import {
  BUILTIN_SKILL_IDS,
  getSkillCategory,
  loadBuiltinSkillsFromCatalog,
  parseSkillMarkdownFromString,
  toAppSkill,
  toRuntimeSkill,
  type RuntimeSkill,
} from '@/lib/skills'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { CUSTOM_SKILL_TEMPLATE } from '@/lib/skills/custom-skill-template'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export { CUSTOM_SKILL_TEMPLATE }

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}

function isMissingSkillsTableError(message: string): boolean {
  return /does not exist|schema cache|PGRST205|relation "public\.(skill_catalog|user_custom_skills|user_skill_installs)"/i.test(message)
}

function toSkillServiceError(error: unknown): Error {
  const message = getErrorMessage(error)
  if (isMissingSkillsTableError(message)) {
    return new Error('技能数据库表尚未创建。请在 Supabase SQL Editor 执行 supabase/migrations/20260614000000_add_skills_system.sql')
  }
  if (/row-level security|permission denied|42501/i.test(message)) {
    return new Error('保存失败：数据库权限不足。请确认已登录，并在 Supabase 执行技能系统迁移 SQL 中的 RLS 策略')
  }
  if (/duplicate key|unique constraint|23505/i.test(message)) {
    return new Error('同名技能已存在，请修改 SKILL.md 中的 name 字段')
  }
  if (/user_custom_skills_name_format|check constraint|23514/i.test(message)) {
    return new Error('技能 name 须为 kebab-case，例如 my-writing-style')
  }
  if (/violates foreign key|23503/i.test(message)) {
    return new Error('官方技能目录尚未初始化，请在 Supabase SQL Editor 执行 supabase/migrations/20260614000002_seed_skill_catalog.sql')
  }
  if (/row-level security.*skill_catalog|skill_catalog.*row-level security/i.test(message)) {
    return new Error('官方技能目录写入失败：请在 Supabase SQL Editor 执行 supabase/migrations/20260614000002_seed_skill_catalog.sql')
  }
  return new Error(message)
}

export function normalizeCustomSkillInput(input: {
  name?: string
  displayName?: string
  description?: string
  skillMd?: string
}) {
  const skillMd = typeof input.skillMd === 'string' ? input.skillMd.trim() : ''
  if (!skillMd) {
    throw new Error('请填写 SKILL.md 内容')
  }

  let parsed
  try {
    parsed = parseSkillMarkdownFromString(skillMd, input.name)
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }

  const name = parsed.frontmatter.name
  const nv = parsed.frontmatter.metadata?.narraverse
  const nvDisplayName = typeof nv?.displayName === 'string' ? nv.displayName : ''
  const displayName = (typeof input.displayName === 'string' ? input.displayName.trim() : '')
    || nvDisplayName
    || name
  const description = (typeof input.description === 'string' ? input.description.trim() : '')
    || String(parsed.frontmatter.description).trim()

  return { name, displayName, description, skillMd }
}

export interface UserCustomSkillRow {
  id: string
  user_id: string
  name: string
  display_name: string
  description: string
  skill_md: string
  enabled: boolean
}

export interface SkillMarketplaceItem {
  id: string
  name: string
  displayName: string
  description: string
  category: string
  license: 'official' | 'community' | 'user'
  version: string
  isBuiltin: boolean
  installed: boolean
  enabled: boolean
  isCustom: boolean
}

const DEFAULT_USER_SKILL_MODES = [
  'ask', 'plan', 'outline', 'worldbook', 'agent',
  'brainstorm', 'craft', 'polish',
]

export function runtimeSkillFromCustomRow(row: UserCustomSkillRow): Skill {
  const parsed = parseSkillMarkdownFromString(row.skill_md, row.name)
  const runtime = toRuntimeSkill(parsed, {
    id: `user-${row.id}`,
    isUserSkill: true,
  })
  runtime.compatibleModes = runtime.compatibleModes ?? DEFAULT_USER_SKILL_MODES
  runtime.license = 'user'
  return toAppSkill({
    ...runtime,
    name: row.display_name,
    description: row.description,
  })
}

export function runtimeSkillFromCatalogMd(skillId: string, skillMd: string): Skill {
  const parsed = parseSkillMarkdownFromString(skillMd, skillId)
  return toAppSkill(toRuntimeSkill(parsed))
}

async function catalogHasEntries(supabase: SupabaseServerClient): Promise<boolean> {
  const { count, error } = await supabase
    .from('skill_catalog')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return (count ?? 0) > 0
}

async function seedSkillCatalogViaRpc(supabase: SupabaseServerClient): Promise<boolean> {
  const { error } = await supabase.rpc('seed_builtin_skill_catalog')
  if (!error) return true

  const message = getErrorMessage(error)
  if (/function public\.seed_builtin_skill_catalog|42883|PGRST202/i.test(message)) {
    return false
  }
  throw error
}

async function seedSkillCatalogViaAdmin(): Promise<void> {
  let admin
  try {
    admin = createServiceRoleClient()
  } catch {
    throw new Error('官方技能目录初始化失败：请在 .env.local 配置 SUPABASE_SERVICE_ROLE_KEY（Supabase → Project Settings → API）')
  }

  if (await catalogHasEntries(admin)) return

  const builtins = loadBuiltinSkillsFromCatalog()
  const rows = builtins.map((skill) => {
    const skillDir = BUILTIN_SKILL_IDS.find(id => id === skill.id)
    const category = skillDir ? getSkillCategory(skillDir) : 'writing-style'
    return {
      id: skill.id,
      display_name: skill.name,
      description: skill.description,
      category,
      license_type: 'official',
      skill_md: buildSkillMdFromRuntime(skill),
      version: '1.0.0',
      is_builtin: true,
    }
  })

  const { error } = await admin.from('skill_catalog').insert(rows)
  if (error) throw error
}

/** Ensure skill_catalog has builtin rows. Prefers SECURITY DEFINER RPC (no service role needed). */
export async function seedSkillCatalogIfEmpty(supabaseClient?: SupabaseServerClient) {
  const supabase = supabaseClient ?? await createClient()

  if (await catalogHasEntries(supabase)) return

  const seededViaRpc = await seedSkillCatalogViaRpc(supabase)
  if (seededViaRpc) {
    if (await catalogHasEntries(supabase)) return
  }

  await seedSkillCatalogViaAdmin()
}

function buildCatalogItemsFromFilesystem(
  installMap: Map<string, boolean>,
): SkillMarketplaceItem[] {
  return loadBuiltinSkillsFromCatalog().map((skill) => {
    const category = BUILTIN_SKILL_IDS.includes(skill.id as typeof BUILTIN_SKILL_IDS[number])
      ? getSkillCategory(skill.id as typeof BUILTIN_SKILL_IDS[number])
      : 'writing-style'
    const installed = installMap.has(skill.id) ? (installMap.get(skill.id) ?? true) : true
    return {
      id: skill.id,
      name: skill.id,
      displayName: skill.name,
      description: skill.description,
      category,
      license: 'official' as const,
      version: '1.0.0',
      isBuiltin: true,
      installed,
      enabled: installed,
      isCustom: false,
    }
  })
}

function buildSkillMdFromRuntime(skill: RuntimeSkill): string {
  return `---\nname: ${skill.id}\ndescription: ${JSON.stringify(skill.description)}\nmetadata:\n  author: narraverse\n  version: "1.0.0"\n  narraverse:\n    displayName: ${JSON.stringify(skill.name)}\n    scope: runtime\n    license: official\n---\n\n${skill.systemPrompt}`
}

export async function listMarketplaceSkills(userId: string): Promise<SkillMarketplaceItem[]> {
  const supabase = await createClient()

  try {
    await seedSkillCatalogIfEmpty(supabase)
  } catch (error) {
    console.warn('[skills] catalog seed skipped:', getErrorMessage(error))
  }

  const [{ data: catalog, error: catalogError }, { data: installs, error: installsError }, { data: customs, error: customsError }] = await Promise.all([
    supabase.from('skill_catalog').select('*').order('is_builtin', { ascending: false }).order('id'),
    supabase.from('user_skill_installs').select('skill_id, enabled').eq('user_id', userId),
    supabase.from('user_custom_skills').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
  ])

  if (installsError) throw installsError
  if (customsError) throw customsError

  const installMap = new Map((installs ?? []).map(row => [row.skill_id, row.enabled]))

  const catalogItems: SkillMarketplaceItem[] = catalogError || !(catalog?.length)
    ? buildCatalogItemsFromFilesystem(installMap)
    : catalog.map(row => ({
        id: row.id,
        name: row.id,
        displayName: row.display_name,
        description: row.description,
        category: row.category,
        license: row.license_type as 'official' | 'community',
        version: row.version,
        isBuiltin: row.is_builtin,
        installed: installMap.has(row.id) ? (installMap.get(row.id) ?? true) : row.is_builtin,
        enabled: installMap.has(row.id) ? (installMap.get(row.id) ?? true) : row.is_builtin,
        isCustom: false,
      }))

  const customItems: SkillMarketplaceItem[] = (customs ?? []).map(row => ({
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    description: row.description,
    category: 'custom',
    license: 'user' as const,
    version: '1.0.0',
    isBuiltin: false,
    installed: true,
    enabled: row.enabled,
    isCustom: true,
  }))

  return [...catalogItems, ...customItems]
}

export async function resolveActiveSkillsForUser(userId?: string): Promise<Skill[]> {
  const builtins = loadBuiltinSkillsFromCatalog().map(toAppSkill)
  if (!userId) return builtins

  const supabase = await createClient()

  try {
    await seedSkillCatalogIfEmpty(supabase)
  } catch (error) {
    console.warn('[skills] catalog seed skipped:', getErrorMessage(error))
  }

  const [{ data: installs }, { data: customs }, { data: catalogInstalls }] = await Promise.all([
    supabase
      .from('user_skill_installs')
      .select('skill_id, enabled, skill_catalog(skill_md)')
      .eq('user_id', userId)
      .eq('enabled', true),
    supabase
      .from('user_custom_skills')
      .select('*')
      .eq('user_id', userId)
      .eq('enabled', true),
    supabase
      .from('user_skill_installs')
      .select('skill_id, enabled')
      .eq('user_id', userId),
  ])

  const installState = new Map((catalogInstalls ?? []).map(row => [row.skill_id, row.enabled]))
  const activeBuiltins = builtins.filter((skill) => {
    const state = installState.get(skill.id)
    if (state === undefined) return true
    return state
  })

  const extra: Skill[] = []

  for (const install of installs ?? []) {
    const catalog = install.skill_catalog as { skill_md?: string } | null
    if (!catalog?.skill_md) continue
    if (BUILTIN_SKILL_IDS.includes(install.skill_id as typeof BUILTIN_SKILL_IDS[number])) continue
    extra.push(runtimeSkillFromCatalogMd(install.skill_id, catalog.skill_md))
  }

  for (const custom of customs ?? []) {
    extra.push(runtimeSkillFromCustomRow(custom as UserCustomSkillRow))
  }

  const merged = new Map<string, Skill>()
  for (const skill of [...activeBuiltins, ...extra]) {
    merged.set(skill.id, skill)
  }
  return Array.from(merged.values())
}

export async function setSkillInstalled(userId: string, skillId: string, enabled: boolean) {
  const supabase = await createClient()
  await seedSkillCatalogIfEmpty(supabase)

  const { data: catalogRow, error: catalogError } = await supabase
    .from('skill_catalog')
    .select('id')
    .eq('id', skillId)
    .maybeSingle()

  if (catalogError) throw toSkillServiceError(catalogError)
  if (!catalogRow) {
    throw new Error('官方技能目录尚未初始化，请在 Supabase SQL Editor 执行 supabase/migrations/20260614000002_seed_skill_catalog.sql')
  }

  const { error } = await supabase.from('user_skill_installs').upsert(
    {
      user_id: userId,
      skill_id: skillId,
      enabled,
    },
    { onConflict: 'user_id,skill_id' },
  )
  if (error) throw toSkillServiceError(error)
}

export async function upsertCustomSkill(
  userId: string,
  input: { id?: string, name?: string, displayName?: string, description?: string, skillMd?: string, enabled?: boolean },
  supabaseClient?: SupabaseServerClient,
) {
  const normalized = normalizeCustomSkillInput(input)

  const supabase = supabaseClient ?? await createClient()
  const payload = {
    user_id: userId,
    name: normalized.name,
    display_name: normalized.displayName,
    description: normalized.description,
    skill_md: normalized.skillMd,
    enabled: input.enabled ?? true,
    updated_at: new Date().toISOString(),
  }

  if (input.id) {
    const { data, error } = await supabase
      .from('user_custom_skills')
      .update(payload)
      .eq('id', input.id)
      .eq('user_id', userId)
      .select('*')
      .single()
    if (error) throw toSkillServiceError(error)
    return data as UserCustomSkillRow
  }

  const { data, error } = await supabase
    .from('user_custom_skills')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw toSkillServiceError(error)
  return data as UserCustomSkillRow
}

export async function getCustomSkill(userId: string, id: string): Promise<UserCustomSkillRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_custom_skills')
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as UserCustomSkillRow | null
}

export async function setCustomSkillEnabled(userId: string, id: string, enabled: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('user_custom_skills')
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', id)
  if (error) throw error
}

export async function deleteCustomSkill(userId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('user_custom_skills')
    .delete()
    .eq('user_id', userId)
    .eq('id', id)
  if (error) throw toSkillServiceError(error)
}

