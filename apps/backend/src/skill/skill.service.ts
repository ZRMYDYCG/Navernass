import type { Prisma } from '../generated/prisma/client.js'
import type { BindNovelSkills, CustomSkill, InstallSkill, SkillQuery, UpdateCustomSkill } from './skill.schema.js'
import { randomUUID } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'
import { AppError } from '../common/app-error.js'
import { PrismaService } from '../database/prisma.service.js'
import { SkillParser } from './skill.parser.js'
import { SkillRegistry } from './skill.registry.js'

@Injectable()
export class SkillService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(SkillParser) private readonly parser: SkillParser,
    @Inject(SkillRegistry) private readonly registry: SkillRegistry,
  ) {}

  async list(userId: string, query: SkillQuery) {
    const where: Prisma.SkillDefWhereInput = {
      status: 'published',
      OR: [{ owner_id: null }, { owner_id: userId }],
      ...(query.category && { category: query.category }),
      ...(query.source && { source: query.source }),
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.skillDef.findMany({
        where,
        orderBy: [{ is_builtin: 'desc' }, { display_name: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          installs: { where: { user_id: userId }, take: 1 },
          novels: query.novelId ? { where: { user_id: userId, novel_id: query.novelId }, take: 1 } : false,
        },
      }),
      this.prisma.skillDef.count({ where }),
    ])
    return {
      data: rows.map(row => this.toItem(row)),
      total,
    }
  }

  async detail(userId: string, id: string) {
    const skill = await this.prisma.skillDef.findFirst({
      where: { id, status: 'published', OR: [{ owner_id: null }, { owner_id: userId }] },
      include: { installs: { where: { user_id: userId }, take: 1 } },
    })
    if (!skill) throw AppError.notFound('SKILL_NOT_FOUND', 'Skill')
    return { ...this.toItem(skill), skillMd: skill.skill_md, manifest: skill.manifest }
  }

  async install(userId: string, skillId: string, input: InstallSkill) {
    await this.requireAccessible(userId, skillId)
    return this.prisma.skillInstall.upsert({
      where: { user_id_skill_id: { user_id: userId, skill_id: skillId } },
      create: { user_id: userId, skill_id: skillId, enabled: input.enabled, config: input.config as Prisma.InputJsonValue },
      update: { enabled: input.enabled, config: input.config as Prisma.InputJsonValue },
    })
  }

  async listCustom(userId: string) {
    return this.prisma.skillDef.findMany({
      where: { owner_id: userId, source: 'custom' },
      orderBy: { updated_at: 'desc' },
      include: { installs: { where: { user_id: userId }, take: 1 } },
    }).then(rows => rows.map(row => ({ ...this.toItem(row), skillMd: row.skill_md, manifest: row.manifest })))
  }

  async createCustom(userId: string, input: CustomSkill) {
    const parsed = this.parser.parse(input.skillMd)
    const id = randomUUID()
    const metadata = parsed.frontmatter.metadata
    try {
      return await this.prisma.$transaction(async (tx) => {
        const skill = await tx.skillDef.create({ data: {
          id,
          slug: parsed.frontmatter.name,
          owner_id: userId,
          display_name: parsed.body.split('\n').find(line => line.startsWith('# '))?.slice(2).trim() || parsed.frontmatter.name,
          description: parsed.frontmatter.description,
          category: typeof metadata?.category === 'string' ? metadata.category : 'custom',
          source: 'custom',
          license: parsed.frontmatter.license ?? 'user',
          skill_md: input.skillMd,
          manifest: parsed.frontmatter as unknown as Prisma.InputJsonValue,
          version: typeof metadata?.version === 'string' ? metadata.version : '1.0.0',
          checksum: this.registry.checksum(input.skillMd),
          status: 'published',
        } })
        await tx.skillInstall.create({ data: { user_id: userId, skill_id: id, enabled: input.enabled, config: {} } })
        return skill
      })
    } catch (error) {
      if (this.isUniqueError(error)) throw new AppError('CONFLICT', `自定义 Skill 名称已存在：${parsed.frontmatter.name}`, 409)
      throw error
    }
  }

  async updateCustom(userId: string, id: string, input: UpdateCustomSkill) {
    const current = await this.requireCustom(userId, id)
    const skillMd = input.skillMd ?? current.skill_md
    const parsed = this.parser.parse(skillMd)
    const metadata = parsed.frontmatter.metadata
    try {
      return await this.prisma.$transaction(async (tx) => {
        const skill = await tx.skillDef.update({
          where: { id },
          data: {
            slug: parsed.frontmatter.name,
            display_name: parsed.body.split('\n').find(line => line.startsWith('# '))?.slice(2).trim() || parsed.frontmatter.name,
            description: parsed.frontmatter.description,
            skill_md: skillMd,
            manifest: parsed.frontmatter as unknown as Prisma.InputJsonValue,
            category: typeof metadata?.category === 'string' ? metadata.category : current.category,
            license: parsed.frontmatter.license ?? current.license,
            version: typeof metadata?.version === 'string' ? metadata.version : current.version,
            checksum: this.registry.checksum(skillMd),
          },
        })
        if (input.enabled !== undefined) {
          await tx.skillInstall.upsert({
            where: { user_id_skill_id: { user_id: userId, skill_id: id } },
            create: { user_id: userId, skill_id: id, enabled: input.enabled, config: {} },
            update: { enabled: input.enabled },
          })
        }
        return skill
      })
    } catch (error) {
      if (this.isUniqueError(error)) throw new AppError('CONFLICT', `自定义 Skill 名称已存在：${parsed.frontmatter.name}`, 409)
      throw error
    }
  }

  async removeCustom(userId: string, id: string) {
    await this.requireCustom(userId, id)
    await this.prisma.skillDef.delete({ where: { id } })
  }

  async listNovel(userId: string, novelId: string) {
    await this.requireNovel(userId, novelId)
    return this.prisma.novelSkill.findMany({
      where: { user_id: userId, novel_id: novelId },
      orderBy: [{ priority: 'desc' }, { created_at: 'asc' }],
      include: { skill: { select: { id: true, slug: true, display_name: true, description: true, source: true, version: true } } },
    })
  }

  async bindNovel(userId: string, novelId: string, input: BindNovelSkills) {
    await this.requireNovel(userId, novelId)
    const ids = input.skills.map(skill => skill.skillId)
    if (ids.length) {
      const accessible = await this.prisma.skillDef.findMany({
        where: { id: { in: ids }, status: 'published', OR: [{ owner_id: null }, { owner_id: userId }] },
        include: { installs: { where: { user_id: userId, enabled: true }, take: 1 } },
      })
      const allowed = new Set(accessible.filter(skill => skill.is_builtin || skill.owner_id === userId || skill.installs.length > 0).map(skill => skill.id))
      const missing = ids.filter(id => !allowed.has(id))
      if (missing.length) throw new AppError('SKILL_NOT_FOUND', `Skill 未安装或不存在：${missing.join(', ')}`, 404)
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.novelSkill.deleteMany({ where: { user_id: userId, novel_id: novelId } })
      if (input.skills.length) {
        await tx.novelSkill.createMany({ data: input.skills.map(skill => ({
          user_id: userId,
          novel_id: novelId,
          skill_id: skill.skillId,
          enabled: skill.enabled,
          priority: skill.priority,
          config: skill.config as Prisma.InputJsonValue,
        })) })
      }
    })
    return this.listNovel(userId, novelId)
  }

  private toItem(row: {
    id: string
    slug: string
    owner_id: string | null
    display_name: string
    description: string
    category: string
    source: string
    license: string
    version: string
    is_builtin: boolean
    status: string
    installs: Array<{ enabled: boolean, config: Prisma.JsonValue }>
    novels?: Array<{ enabled: boolean, priority: number, config: Prisma.JsonValue }> | false
  }) {
    const install = row.installs[0]
    const novel = Array.isArray(row.novels) ? row.novels[0] : undefined
    return {
      id: row.id,
      slug: row.slug,
      displayName: row.display_name,
      description: row.description,
      category: row.category,
      source: row.source,
      license: row.license,
      version: row.version,
      isBuiltin: row.is_builtin,
      isCustom: row.source === 'custom',
      installed: Boolean(install) || row.is_builtin,
      enabled: novel?.enabled ?? install?.enabled ?? row.is_builtin,
      installConfig: install?.config ?? {},
      novelConfig: novel?.config,
      priority: novel?.priority,
    }
  }

  private async requireAccessible(userId: string, id: string) {
    const skill = await this.prisma.skillDef.findFirst({ where: { id, status: 'published', OR: [{ owner_id: null }, { owner_id: userId }] } })
    if (!skill) throw AppError.notFound('SKILL_NOT_FOUND', 'Skill')
    return skill
  }

  private async requireCustom(userId: string, id: string) {
    const skill = await this.prisma.skillDef.findFirst({ where: { id, owner_id: userId, source: 'custom' } })
    if (!skill) throw AppError.notFound('SKILL_NOT_FOUND', '自定义 Skill')
    return skill
  }

  private async requireNovel(userId: string, novelId: string) {
    const novel = await this.prisma.novel.findFirst({ where: { id: novelId, user_id: userId }, select: { id: true } })
    if (!novel) throw AppError.notFound('NOVEL_NOT_FOUND', '小说')
  }

  private isUniqueError(error: unknown) {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002'
  }
}
