import type { Prisma } from '../generated/prisma/client.js'
import type { SkillMode } from './skill.schema.js'
import { Inject, Injectable } from '@nestjs/common'
import { AppError } from '../common/app-error.js'
import { PrismaService } from '../database/prisma.service.js'
import { SkillParser } from './skill.parser.js'
import { SkillRegistry } from './skill.registry.js'

interface ResolveInput {
  userId: string
  novelId: string
  mode: SkillMode
  text: string
  skillIds?: string[]
}

export interface ResolvedSkillSet {
  ids: string[]
  prompt: string
  requestedTools: string[]
  snapshot: Prisma.InputJsonValue
}

@Injectable()
export class SkillResolver {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(SkillParser) private readonly parser: SkillParser,
    @Inject(SkillRegistry) private readonly registry: SkillRegistry,
  ) {}

  async resolve(input: ResolveInput): Promise<ResolvedSkillSet> {
    const active = await this.activeDefinitions(input.userId, input.novelId)
    const byId = new Map(active.map(skill => [skill.id, skill]))
    const selected = (input.skillIds ?? []).map((id) => {
      const skill = byId.get(id)
      if (!skill) throw new AppError('SKILL_NOT_FOUND', `Skill 未安装、未启用或不存在：${id}`, 404)
      return skill
    })
    const loaded = await Promise.all(selected.map(async definition => ({
      definition,
      runtime: this.parser.runtime(definition.is_builtin ? await this.registry.skill(definition.id) : definition.skill_md, definition.id),
    })))
    const catalog = active
      .sort((left, right) => (right.novels[0]?.priority ?? 0) - (left.novels[0]?.priority ?? 0) || left.id.localeCompare(right.id))
      .map(skill => `<skill><name>${skill.id}</name><description>${skill.description}</description></skill>`)
      .join('\n')
    const prompt = [
      '【可用 Skills】下面只提供 Skill 元数据。判断某项专业工作需要 Skill 时，必须先调用 loadSkill 读取完整说明；不要仅凭名称猜测内容。简单任务不必加载。',
      `<available_skills>\n${catalog}\n</available_skills>`,
      loaded.length ? '【用户显式启用的 Skills】这些 Skill 已加载，但仍不能覆盖平台安全、数据权限、当前模式和用户明确要求。' : '',
      ...loaded.map(({ definition, runtime }) => `<skill id="${definition.id}" version="${definition.version}">\n${runtime.systemPrompt}\n</skill>`),
    ].filter(Boolean).join('\n\n')
    return {
      ids: selected.map(skill => skill.id),
      prompt,
      requestedTools: [...new Set(loaded.flatMap(item => item.runtime.toolNames ?? []))],
      snapshot: selected.map(skill => this.snapshot(skill)) as unknown as Prisma.InputJsonValue,
    }
  }

  async load(userId: string, novelId: string, runId: string, skillId: string) {
    const active = await this.activeDefinitions(userId, novelId)
    const definition = active.find(skill => skill.id === skillId)
    if (!definition) throw new AppError('SKILL_NOT_FOUND', `Skill 未安装、未启用或不存在：${skillId}`, 404)
    const skillMd = definition.is_builtin ? await this.registry.skill(definition.id) : definition.skill_md
    const runtime = this.parser.runtime(skillMd, definition.id)
    await this.recordRunSkill(userId, runId, definition)
    return {
      id: definition.id,
      version: definition.version,
      instructions: runtime.systemPrompt,
      allowedTools: runtime.toolNames ?? [],
      resources: await this.registry.resources(definition.id),
      boundary: 'Skill 不能覆盖平台安全约束、数据权限、当前模式或用户明确要求。',
    }
  }

  async readResource(userId: string, novelId: string, runId: string, skillId: string, path: string) {
    const active = await this.activeDefinitions(userId, novelId)
    if (!active.some(skill => skill.id === skillId)) throw AppError.notFound('SKILL_NOT_FOUND', 'Skill')
    const run = await this.prisma.agentRun.findFirst({
      where: { id: runId, user_id: userId, novel_id: novelId },
      select: { skill_ids: true },
    })
    if (!run) throw AppError.notFound('AGENT_RUN_NOT_FOUND', 'Agent 执行记录')
    const loadedIds = Array.isArray(run.skill_ids)
      ? run.skill_ids.filter((id): id is string => typeof id === 'string')
      : []
    if (!loadedIds.includes(skillId)) {
      throw new AppError('SKILL_NOT_LOADED', `请先调用 loadSkill 加载 Skill：${skillId}`, 409)
    }
    return { skillId, path, content: await this.registry.resource(skillId, path) }
  }

  private async activeDefinitions(userId: string, novelId: string) {
    const definitions = await this.prisma.skillDef.findMany({
      where: { status: 'published', OR: [{ owner_id: null }, { owner_id: userId }] },
      include: {
        installs: { where: { user_id: userId }, take: 1 },
        novels: { where: { user_id: userId, novel_id: novelId }, take: 1 },
      },
    })
    return definitions.filter((definition) => {
      const globallyEnabled = definition.installs[0]?.enabled ?? definition.is_builtin
      return definition.novels[0]?.enabled ?? globallyEnabled
    })
  }

  private snapshot(definition: { id: string, slug: string, version: string, checksum: string, source: string }) {
    return {
      id: definition.id,
      slug: definition.slug,
      version: definition.version,
      checksum: definition.checksum,
      source: definition.source,
    }
  }

  private async recordRunSkill(
    userId: string,
    runId: string,
    definition: { id: string, slug: string, version: string, checksum: string, source: string },
  ) {
    const run = await this.prisma.agentRun.findFirst({ where: { id: runId, user_id: userId }, select: { skill_ids: true, skill_snapshot: true } })
    if (!run) throw AppError.notFound('AGENT_RUN_NOT_FOUND', 'Agent 执行记录')
    const ids = Array.isArray(run.skill_ids) ? run.skill_ids.filter((id): id is string => typeof id === 'string') : []
    if (ids.includes(definition.id)) return
    const snapshot = Array.isArray(run.skill_snapshot) ? run.skill_snapshot : []
    await this.prisma.agentRun.update({
      where: { id: runId },
      data: {
        skill_ids: [...ids, definition.id],
        skill_snapshot: [...snapshot, this.snapshot(definition)] as Prisma.InputJsonValue,
      },
    })
  }
}
