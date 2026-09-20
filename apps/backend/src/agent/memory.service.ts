import type { Prisma } from '../generated/prisma/client.js'
import type { SaveMemory, SearchMemory, SyncMemory } from './agent.schema.js'
import { createHash, randomUUID } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'
import { embed } from 'ai'
import { AppError } from '../common/app-error.js'
import { PrismaService } from '../database/prisma.service.js'
import { ModelService } from './model.service.js'
import { VectorService } from './vector.service.js'

@Injectable()
export class MemoryService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ModelService) private readonly models: ModelService,
    @Inject(VectorService) private readonly vectors: VectorService,
  ) {}

  async save(userId: string, input: SaveMemory) {
    await this.assertNovel(userId, input.novelId)
    const { model } = await this.models.embedding(userId, input.providerId)
    const { embedding } = await embed({ model, value: input.content })
    const current = input.sourceId
      ? await this.prisma.semanticMemory.findFirst({
          where: { user_id: userId, novel_id: input.novelId, kind: input.kind, source_id: input.sourceId },
        })
      : null
    const vectorId = current?.vector_id ?? randomUUID()
    await this.vectors.upsert(vectorId, embedding, {
      userId,
      novelId: input.novelId,
      chapterId: input.chapterId,
      kind: input.kind,
    })
    const data = {
      chapter_id: input.chapterId,
      title: input.title,
      content: input.content,
      content_hash: createHash('sha256').update(input.content).digest('hex'),
      metadata: input.metadata as Prisma.InputJsonValue,
    }
    if (current) return this.prisma.semanticMemory.update({ where: { id: current.id }, data })
    return this.prisma.semanticMemory.create({
      data: {
        ...data,
        user_id: userId,
        novel_id: input.novelId,
        source_id: input.sourceId,
        vector_id: vectorId,
        kind: input.kind,
      },
    })
  }

  async search(userId: string, input: SearchMemory) {
    await this.assertNovel(userId, input.novelId)
    const { model } = await this.models.embedding(userId, input.providerId)
    const { embedding } = await embed({ model, value: input.query })
    const vectorHits = await this.vectors.search(
      embedding,
      { userId, novelId: input.novelId, chapterId: input.chapterId, kind: 'search' },
      input.kinds,
      input.limit,
      input.minScore,
    )
    const vectorScores = new Map<string, number>(vectorHits.map(hit => [String(hit.id), hit.score]))
    const keywordHits = await this.prisma.semanticMemory.findMany({
      where: {
        user_id: userId,
        novel_id: input.novelId,
        ...(input.chapterId && { chapter_id: input.chapterId }),
        ...(input.kinds?.length && { kind: { in: input.kinds } }),
        content: { contains: input.query },
      },
      take: input.limit,
      orderBy: { updated_at: 'desc' },
    })
    const vectorRows = vectorScores.size
      ? await this.prisma.semanticMemory.findMany({ where: { vector_id: { in: [...vectorScores.keys()] } } })
      : []
    const merged = new Map<string, { item: typeof keywordHits[number], score: number, sources: string[] }>()
    for (const item of vectorRows) {
      merged.set(item.id, { item, score: vectorScores.get(item.vector_id) ?? 0, sources: ['vector'] })
    }
    for (const item of keywordHits) {
      const found = merged.get(item.id)
      if (found) {
        found.score = Math.min(1, found.score * 0.8 + 0.2)
        found.sources.push('keyword')
      } else {
        merged.set(item.id, { item, score: 0.2, sources: ['keyword'] })
      }
    }
    return [...merged.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, input.limit)
      .map(({ item, ...rank }) => ({ ...item, ...rank }))
  }

  async sync(userId: string, input: SyncMemory) {
    await this.assertNovel(userId, input.novelId)
    const sources: SaveMemory[] = []
    if (input.kinds.includes('chapter')) {
      const rows = await this.prisma.chapter.findMany({ where: { novel_id: input.novelId, user_id: userId, deleted_at: null } })
      sources.push(...rows.filter(row => row.content.trim()).map(row => ({
        novelId: input.novelId,
        chapterId: row.id,
        sourceId: row.id,
        kind: 'chapter' as const,
        title: row.title,
        content: row.content,
        metadata: { orderIndex: row.order_index },
        providerId: input.providerId,
      })))
    }
    if (input.kinds.includes('worldbook')) {
      const rows = await this.prisma.worldbookEntry.findMany({ where: { novel_id: input.novelId, user_id: userId, deleted_at: null } })
      sources.push(...rows.map(row => ({ novelId: input.novelId, sourceId: row.id, kind: 'worldbook' as const, title: row.title, content: row.content, metadata: { category: row.category }, providerId: input.providerId })))
    }
    if (input.kinds.includes('outline')) {
      const rows = await this.prisma.outline.findMany({ where: { novel_id: input.novelId, user_id: userId, deleted_at: null } })
      sources.push(...rows.map(row => ({ novelId: input.novelId, sourceId: row.id, kind: 'outline' as const, title: row.title, content: row.content, metadata: { orderIndex: row.order_index }, providerId: input.providerId })))
    }
    if (input.kinds.includes('timeline')) {
      const rows = await this.prisma.timelineEvent.findMany({ where: { novel_id: input.novelId, user_id: userId, deleted_at: null } })
      sources.push(...rows.map(row => ({ novelId: input.novelId, chapterId: row.chapter_id, sourceId: row.id, kind: 'timeline' as const, title: row.title, content: row.description, metadata: { characterId: row.character_id, position: row.timeline_position }, providerId: input.providerId })))
    }
    let indexed = 0
    for (const source of sources) {
      const hash = createHash('sha256').update(source.content).digest('hex')
      const current = source.sourceId ? await this.prisma.semanticMemory.findFirst({ where: { novel_id: input.novelId, kind: source.kind, source_id: source.sourceId } }) : null
      if (current?.content_hash === hash) continue
      await this.save(userId, source)
      indexed += 1
    }
    return { scanned: sources.length, indexed, skipped: sources.length - indexed }
  }

  private async assertNovel(userId: string, novelId: string) {
    const novel = await this.prisma.novel.findFirst({ where: { id: novelId, user_id: userId } })
    if (!novel) throw AppError.notFound('NOVEL_NOT_FOUND', '小说')
  }
}
