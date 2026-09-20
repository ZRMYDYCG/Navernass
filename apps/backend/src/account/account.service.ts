import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service.js'
import type { UpdateProfile } from './account.schema.js'

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(userId: string) {
    return this.prisma.profile.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {},
    })
  }

  async updateProfile(userId: string, data: UpdateProfile) {
    return this.prisma.profile.upsert({
      where: { id: userId },
      create: { id: userId, ...data },
      update: data,
    })
  }

  async workspace(userId: string) {
    const [novels, chapters, volumes, worldbook, outlines, plans, todos] = await Promise.all([
      this.prisma.novel.aggregate({ where: { user_id: userId, status: { not: 'archived' } }, _count: true, _sum: { word_count: true } }),
      this.prisma.chapter.count({ where: { user_id: userId, deleted_at: null } }),
      this.prisma.volume.count({ where: { user_id: userId, deleted_at: null } }),
      this.prisma.worldbookEntry.count({ where: { user_id: userId, deleted_at: null } }),
      this.prisma.outline.count({ where: { user_id: userId, deleted_at: null } }),
      this.prisma.planFile.count({ where: { user_id: userId, deleted_at: null } }),
      this.prisma.writerTodo.count({ where: { user_id: userId, completed: false } }),
    ])
    return {
      novel_count: novels._count,
      word_count: novels._sum.word_count ?? 0,
      chapter_count: chapters,
      volume_count: volumes,
      worldbook_count: worldbook,
      outline_count: outlines,
      plan_file_count: plans,
      open_todo_count: todos,
    }
  }
}
