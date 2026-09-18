import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service.js'
import { AppError } from '../common/app-error.js'
import type { AdminResource } from './admin.schema.js'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: userId }, include: { user: true } })
    if (!profile) throw AppError.notFound('NOT_FOUND', '用户资料')
    return profile
  }

  async stats() {
    const [users, profiles, novels, chapters, volumes, surveys, news, messageWall, writerTodos, planFiles, worldbook, outlines, timelineEvents] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.profile.count(),
      this.prisma.novel.count(),
      this.prisma.chapter.count(),
      this.prisma.volume.count(),
      this.prisma.survey.count(),
      this.prisma.news.count(),
      this.prisma.messageWallEntry.count(),
      this.prisma.writerTodo.count(),
      this.prisma.planFile.count(),
      this.prisma.worldbookEntry.count(),
      this.prisma.outline.count(),
      this.prisma.timelineEvent.count(),
    ])
    return { users, profiles, novels, chapters, volumes, surveys, news, messageWall, writerTodos, planFiles, worldbook, outlines, timelineEvents }
  }

  async list(resource: AdminResource, page: number, pageSize: number, status?: string) {
    const skip = (page - 1) * pageSize
    const pageArgs = { skip, take: pageSize }
    switch (resource) {
      case 'users': {
        const [data, total] = await this.prisma.$transaction([
          this.prisma.user.findMany({ ...pageArgs, orderBy: { createdAt: 'desc' }, include: { profile: true } }),
          this.prisma.user.count(),
        ])
        return { data: data.map(({ profile, ...user }) => ({ ...user, ...profile })), total }
      }
      case 'profiles': return this.page(this.prisma.profile.findMany({ ...pageArgs, orderBy: { created_at: 'desc' } }), this.prisma.profile.count())
      case 'novels': return this.page(this.prisma.novel.findMany({ ...pageArgs, where: status ? { status: status as any } : {}, orderBy: { updated_at: 'desc' } }), this.prisma.novel.count({ where: status ? { status: status as any } : {} }))
      case 'chapters': return this.page(this.prisma.chapter.findMany({ ...pageArgs, orderBy: { updated_at: 'desc' } }), this.prisma.chapter.count())
      case 'volumes': return this.page(this.prisma.volume.findMany({ ...pageArgs, orderBy: { updated_at: 'desc' } }), this.prisma.volume.count())
      case 'surveys': return this.page(this.prisma.survey.findMany({ ...pageArgs, orderBy: { created_at: 'desc' } }), this.prisma.survey.count())
      case 'news': return this.page(this.prisma.news.findMany({ ...pageArgs, orderBy: { created_at: 'desc' } }), this.prisma.news.count())
      case 'message-wall': return this.page(this.prisma.messageWallEntry.findMany({ ...pageArgs, orderBy: { created_at: 'desc' } }), this.prisma.messageWallEntry.count())
      case 'writer-todos': return this.page(this.prisma.writerTodo.findMany({ ...pageArgs, orderBy: { updated_at: 'desc' } }), this.prisma.writerTodo.count())
      case 'plan-files': return this.page(this.prisma.planFile.findMany({ ...pageArgs, orderBy: { updated_at: 'desc' } }), this.prisma.planFile.count())
      case 'worldbook': return this.page(this.prisma.worldbookEntry.findMany({ ...pageArgs, orderBy: { updated_at: 'desc' } }), this.prisma.worldbookEntry.count())
      case 'outlines': return this.page(this.prisma.outline.findMany({ ...pageArgs, orderBy: { updated_at: 'desc' } }), this.prisma.outline.count())
      case 'timeline-events': return this.page(this.prisma.timelineEvent.findMany({ ...pageArgs, orderBy: { updated_at: 'desc' } }), this.prisma.timelineEvent.count())
    }
  }

  async delete(resource: AdminResource, id: string, actorId: string) {
    if (resource === 'users') {
      if (id === actorId) throw new AppError('PROTECTED_ADMIN', '不能删除当前登录账号', 409)
      const profile = await this.prisma.profile.findUnique({ where: { id } })
      if (profile?.is_protected || profile?.role === 'super_admin') throw new AppError('PROTECTED_ADMIN', '不能删除受保护的超级管理员', 409)
      await this.prisma.user.delete({ where: { id } })
      return
    }
    if (resource === 'novels') return void await this.prisma.novel.delete({ where: { id } })
    if (resource === 'news') return void await this.prisma.news.delete({ where: { id } })
    if (resource === 'message-wall') return void await this.prisma.messageWallEntry.delete({ where: { id } })
    if (resource === 'writer-todos') return void await this.prisma.writerTodo.delete({ where: { id } })
    if (resource === 'surveys') return void await this.prisma.survey.delete({ where: { id } })
    throw new AppError('BAD_REQUEST', '该资源不支持后台直接删除')
  }

  private async page<T>(dataPromise: Promise<T[]>, countPromise: Promise<number>) {
    const [data, total] = await Promise.all([dataPromise, countPromise])
    return { data, total }
  }
}
