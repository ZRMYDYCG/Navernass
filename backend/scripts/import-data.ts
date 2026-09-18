import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { Pool } from 'pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

const sourceUrl = process.env.SUPABASE_DATABASE_URL
if (!sourceUrl) throw new Error('缺少 SUPABASE_DATABASE_URL')

const source = new Pool({ connectionString: sourceUrl, max: 4, ssl: sourceUrl.includes('localhost') ? false : { rejectUnauthorized: false } })
const target = new PrismaClient({ adapter: new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: Number(process.env.DATABASE_POOL_SIZE ?? 10),
}) })

type Row = Record<string, any>

async function rows(table: string, schema = 'public'): Promise<Row[]> {
  if (!/^[a-z_]+$/i.test(table) || !/^[a-z_]+$/i.test(schema)) throw new Error('非法表名')
  const result = await source.query(`SELECT * FROM ${schema}.${table}`)
  return result.rows
}

async function upsertAll(label: string, data: Row[], handler: (row: Row) => Promise<unknown>) {
  let completed = 0
  for (const row of data) {
    await handler(row)
    completed += 1
    if (completed % 100 === 0) console.info(`${label}: ${completed}/${data.length}`)
  }
  console.info(`${label}: 已迁移 ${completed} 条`)
}

function dates(row: Row) {
  return {
    ...(row.created_at && { created_at: new Date(row.created_at) }),
    ...(row.updated_at && { updated_at: new Date(row.updated_at) }),
    ...(row.deleted_at && { deleted_at: new Date(row.deleted_at) }),
  }
}

async function main() {
  const authUsers = await rows('users', 'auth')
  await upsertAll('auth.users', authUsers, row => target.user.upsert({
    where: { id: row.id },
    create: {
      id: row.id,
      email: row.email ?? `${row.id}@migration.invalid`,
      name: row.raw_user_meta_data?.full_name ?? row.raw_user_meta_data?.name ?? row.email?.split('@')[0] ?? 'Narraverse User',
      image: row.raw_user_meta_data?.avatar_url ?? null,
      emailVerified: Boolean(row.email_confirmed_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at ?? row.created_at),
    },
    update: {},
  }))

  await upsertAll('profiles', await rows('profiles'), row => target.profile.upsert({
    where: { id: row.id },
    create: {
      id: row.id,
      username: row.username,
      full_name: row.full_name,
      avatar_url: row.avatar_url,
      website: row.website,
      legacy_password_hash: row.password_hash,
      role: row.role === 'super_admin' ? 'super_admin' : 'user',
      is_protected: Boolean(row.is_protected),
      ...dates(row),
    },
    update: {},
  }))

  await upsertAll('novels', await rows('novels'), row => target.novel.upsert({
    where: { id: row.id },
    create: {
      ...row,
      tags: row.tags ?? [],
      characters: row.characters ?? [],
      relationships: row.relationships ?? [],
      published_at: row.published_at ? new Date(row.published_at) : null,
      ...dates(row),
    },
    update: {},
  }))

  await upsertAll('volumes', await rows('volumes'), row => target.volume.upsert({
    where: { id: row.id }, create: { ...row, ...dates(row) }, update: {},
  }))
  await upsertAll('chapters', await rows('chapters'), row => target.chapter.upsert({
    where: { id: row.id }, create: { ...row, content: row.content ?? '', ...dates(row) }, update: {},
  }))
  await upsertAll('worldbook_entries', await rows('worldbook_entries'), row => target.worldbookEntry.upsert({
    where: { id: row.id }, create: { ...row, keywords: row.keywords ?? [], ...dates(row) }, update: {},
  }))

  const outlineRows = await rows('outlines')
  const pending = new Map(outlineRows.map(row => [row.id, row]))
  while (pending.size) {
    let progressed = false
    for (const [id, row] of pending) {
      if (row.parent_id && pending.has(row.parent_id)) continue
      await target.outline.upsert({ where: { id }, create: { ...row, ...dates(row) }, update: {} })
      pending.delete(id)
      progressed = true
    }
    if (!progressed) throw new Error('大纲数据存在循环父子关系，迁移已停止')
  }
  console.info(`outlines: 已迁移 ${outlineRows.length} 条`)

  await upsertAll('plan_files', await rows('plan_files'), row => target.planFile.upsert({
    where: { id: row.id }, create: { ...row, ...dates(row) }, update: {},
  }))
  await upsertAll('character_timeline_events', await rows('character_timeline_events'), row => target.timelineEvent.upsert({
    where: { id: row.id }, create: { ...row, ...dates(row) }, update: {},
  }))
  await upsertAll('news', await rows('news'), row => target.news.upsert({
    where: { id: row.id }, create: { ...row, ...dates(row) }, update: {},
  }))
  await upsertAll('surveys', await rows('surveys'), row => target.survey.upsert({
    where: { id: row.id }, create: { ...row, created_at: new Date(row.created_at), genres: row.genres ?? [], pain_points: row.pain_points ?? [], tools: row.tools ?? [], ai_expectations: row.ai_expectations ?? [] } as any, update: {},
  }))
  await upsertAll('writer_todos', await rows('writer_todos'), row => target.writerTodo.upsert({
    where: { id: row.id }, create: { ...row, ...dates(row) }, update: {},
  }))
  await upsertAll('message_wall_entries', await rows('message_wall_entries'), row => target.messageWallEntry.upsert({
    where: { id: row.id }, create: { ...row, created_at: new Date(row.created_at) } as any, update: {},
  }))

  console.info('迁移完成。Supabase 密码哈希不兼容 Better Auth，已有用户需要执行一次密码重置。')
}

main()
  .finally(async () => {
    await source.end()
    await target.$disconnect()
  })
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
