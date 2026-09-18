import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service.js'
import { AppError } from '../common/app-error.js'
import type { Prisma } from '../generated/prisma/client.js'
import type * as input from './planning.schema.js'

@Injectable()
export class PlanningService {
  constructor(private readonly prisma: PrismaService) {}

  async listWorldbook(userId: string, novelId: string, category?: input.CreateWorldbook['category']) {
    await this.ownNovel(userId, novelId)
    return this.prisma.worldbookEntry.findMany({
      where: { user_id: userId, novel_id: novelId, deleted_at: null, ...(category && { category }) },
      orderBy: [{ order_index: 'asc' }, { created_at: 'asc' }],
    })
  }

  async createWorldbook(userId: string, data: input.CreateWorldbook) {
    await this.ownNovel(userId, data.novel_id)
    return this.prisma.worldbookEntry.create({ data: { ...data, user_id: userId, keywords: data.keywords } })
  }

  async updateWorldbook(userId: string, id: string, data: input.UpdateWorldbook) {
    await this.ownRecord('worldbook', userId, id)
    return this.prisma.worldbookEntry.update({ where: { id }, data })
  }

  async deleteWorldbook(userId: string, id: string) {
    await this.ownRecord('worldbook', userId, id)
    await this.prisma.worldbookEntry.update({ where: { id }, data: { deleted_at: new Date() } })
  }

  async listOutlines(userId: string, novelId: string, query: { volumeId?: string, parentId?: string | null }) {
    await this.ownNovel(userId, novelId)
    return this.prisma.outline.findMany({
      where: {
        user_id: userId,
        novel_id: novelId,
        deleted_at: null,
        ...(query.volumeId && { volume_id: query.volumeId }),
        ...(query.parentId !== undefined && { parent_id: query.parentId }),
      },
      orderBy: [{ order_index: 'asc' }, { created_at: 'asc' }],
    })
  }

  async createOutline(userId: string, data: input.CreateOutline) {
    await this.validateOutlineLinks(userId, data.novel_id, data.volume_id, data.parent_id)
    return this.prisma.outline.create({ data: { ...data, user_id: userId, volume_id: data.volume_id ?? null, parent_id: data.parent_id ?? null } })
  }

  async updateOutline(userId: string, id: string, data: input.UpdateOutline) {
    const current = await this.ownRecord('outline', userId, id)
    if (data.parent_id === id) throw new AppError('INVALID_PARENT', '大纲不能成为自己的父节点')
    if (data.volume_id !== undefined || data.parent_id !== undefined) {
      await this.validateOutlineLinks(userId, current.novel_id, data.volume_id, data.parent_id)
      if (data.parent_id && await this.isDescendant(id, data.parent_id)) {
        throw new AppError('INVALID_PARENT', '不能把大纲移动到自己的子节点下')
      }
    }
    return this.prisma.outline.update({ where: { id }, data })
  }

  async deleteOutline(userId: string, id: string) {
    await this.ownRecord('outline', userId, id)
    await this.prisma.outline.delete({ where: { id } })
  }

  async listPlans(userId: string, novelId: string) {
    await this.ownNovel(userId, novelId)
    return this.prisma.planFile.findMany({
      where: { user_id: userId, novel_id: novelId, deleted_at: null },
      orderBy: [{ order_index: 'asc' }, { created_at: 'asc' }],
    })
  }

  async createPlan(userId: string, data: input.CreatePlan) {
    await this.ownNovel(userId, data.novel_id)
    const exists = await this.prisma.planFile.findFirst({ where: { novel_id: data.novel_id, path: data.path, deleted_at: null } })
    if (exists) throw new AppError('PATH_EXISTS', '规划文件路径已存在', 409)
    return this.prisma.planFile.create({ data: { ...data, user_id: userId } })
  }

  async updatePlan(userId: string, id: string, data: input.UpdatePlan) {
    const current = await this.ownRecord('plan', userId, id)
    if (data.path && data.path !== current.path) {
      const exists = await this.prisma.planFile.findFirst({ where: { novel_id: current.novel_id, path: data.path, NOT: { id }, deleted_at: null } })
      if (exists) throw new AppError('PATH_EXISTS', '规划文件路径已存在', 409)
    }
    return this.prisma.planFile.update({ where: { id }, data })
  }

  async deletePlan(userId: string, id: string) {
    await this.ownRecord('plan', userId, id)
    await this.prisma.planFile.delete({ where: { id } })
  }

  async listTimeline(userId: string, novelId: string, characterId?: string) {
    await this.ownNovel(userId, novelId)
    return this.prisma.timelineEvent.findMany({
      where: { user_id: userId, novel_id: novelId, deleted_at: null, ...(characterId && { character_id: characterId }) },
      orderBy: [{ timeline_position: 'asc' }, { created_at: 'asc' }],
    })
  }

  async createTimeline(userId: string, data: input.CreateTimeline) {
    const novel = await this.ownNovel(userId, data.novel_id)
    const characters = Array.isArray(novel.characters) ? novel.characters as Array<{ id?: string }> : []
    if (!characters.some(item => item.id === data.character_id)) throw AppError.notFound('CHARACTER_NOT_FOUND', '角色')
    if (data.chapter_id) {
      const chapter = await this.prisma.chapter.findFirst({ where: { id: data.chapter_id, user_id: userId, novel_id: data.novel_id } })
      if (!chapter) throw AppError.notFound('CHAPTER_NOT_FOUND', '章节')
    }
    return this.prisma.timelineEvent.create({ data: { ...data, user_id: userId, chapter_id: data.chapter_id ?? null, occurred_at_label: data.occurred_at_label ?? null } })
  }

  async updateTimeline(userId: string, id: string, data: input.UpdateTimeline) {
    const current = await this.ownRecord('timeline', userId, id)
    if (data.chapter_id) {
      const chapter = await this.prisma.chapter.findFirst({ where: { id: data.chapter_id, user_id: userId, novel_id: current.novel_id } })
      if (!chapter) throw AppError.notFound('CHAPTER_NOT_FOUND', '章节')
    }
    return this.prisma.timelineEvent.update({ where: { id }, data })
  }

  async deleteTimeline(userId: string, id: string) {
    await this.ownRecord('timeline', userId, id)
    await this.prisma.timelineEvent.update({ where: { id }, data: { deleted_at: new Date() } })
  }

  private async ownNovel(userId: string, id: string) {
    const novel = await this.prisma.novel.findFirst({ where: { id, user_id: userId } })
    if (!novel) throw AppError.notFound('NOVEL_NOT_FOUND', '小说')
    return novel
  }

  private async ownRecord(type: 'worldbook' | 'outline' | 'plan' | 'timeline', userId: string, id: string): Promise<any> {
    const where = { id, user_id: userId, deleted_at: null }
    const result = type === 'worldbook'
      ? await this.prisma.worldbookEntry.findFirst({ where })
      : type === 'outline'
        ? await this.prisma.outline.findFirst({ where })
        : type === 'plan'
          ? await this.prisma.planFile.findFirst({ where })
          : await this.prisma.timelineEvent.findFirst({ where })
    if (!result) throw AppError.notFound('NOT_FOUND', '写作资料')
    return result
  }

  private async validateOutlineLinks(userId: string, novelId: string, volumeId?: string | null, parentId?: string | null) {
    await this.ownNovel(userId, novelId)
    if (volumeId) {
      const volume = await this.prisma.volume.findFirst({ where: { id: volumeId, novel_id: novelId, user_id: userId, deleted_at: null } })
      if (!volume) throw AppError.notFound('VOLUME_NOT_FOUND', '卷')
    }
    if (parentId) {
      const parent = await this.prisma.outline.findFirst({ where: { id: parentId, novel_id: novelId, user_id: userId, deleted_at: null } })
      if (!parent) throw new AppError('INVALID_PARENT', '父大纲不存在')
    }
  }

  private async isDescendant(ancestorId: string, candidateId: string) {
    let cursor: string | null = candidateId
    for (let depth = 0; depth < 100 && cursor; depth += 1) {
      if (cursor === ancestorId) return true
      const node: { parent_id: string | null } | null = await this.prisma.outline.findUnique({ where: { id: cursor }, select: { parent_id: true } })
      cursor = node?.parent_id ?? null
    }
    return false
  }
}
