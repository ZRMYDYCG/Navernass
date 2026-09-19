import type { z } from 'zod'
import type { AuthUser } from '../common/current-user.js'
import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, Query } from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { ApiResult } from '../common/api-result.js'
import { CurrentUser } from '../common/current-user.js'
import { ZodPipe } from '../common/zod-pipe.js'
import { ApiDoc, ApiPageQuery, ApiUuidParam, ApiZodBody } from '../openapi/api-doc.js'
import { MutationResult, ResourceResult } from '../openapi/api-model.js'
import {
  ChapterSearchDto,
  CreateChapterDto,
  CreateCharacterDto,
  CreateNovelDto,
  CreateRelationshipDto,
  CreateVolumeDto,
  OrderItemsDto,
  UpdateChapterDto,
  UpdateCharacterDto,
  UpdateNovelDto,
  UpdateRelationshipDto,
  UpdateVolumeDto,
} from './library.dto.js'
import * as schema from './library.schema.js'
import { LibraryService } from './library.service.js'

@Controller()
@ApiTags('作品资料库')
export class LibraryController {
  constructor(@Inject(LibraryService) private readonly library: LibraryService) {}

  @Get('novels')
  @ApiDoc({ summary: '分页查询当前用户的小说', type: ResourceResult, array: true, paged: true })
  @ApiPageQuery()
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'archived'], description: '作品状态' })
  async novels(@CurrentUser() user: AuthUser, @Query(new ZodPipe(schema.pageQuery)) query: z.infer<typeof schema.pageQuery>) {
    const result = await this.library.listNovels(user.id, query)
    return ApiResult.page(result.data, { ...query, total: result.total })
  }

  @Post('novels')
  @ApiDoc({ summary: '创建小说', type: ResourceResult, status: 201 })
  @ApiZodBody(CreateNovelDto)
  createNovel(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.createNovel)) body: schema.CreateNovelInput) {
    return this.library.createNovel(user.id, body)
  }

  @Get('novels/archived')
  @ApiDoc({ summary: '查询已归档小说', type: ResourceResult, array: true })
  async archived(@CurrentUser() user: AuthUser) {
    const result = await this.library.listNovels(user.id, { page: 1, pageSize: 100, status: 'archived' })
    return result.data
  }

  @Post('novels/reorder')
  @HttpCode(200)
  @ApiDoc({ summary: '批量调整小说排序', type: MutationResult })
  @ApiZodBody(OrderItemsDto)
  async reorderNovels(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.orderItems)) body: z.infer<typeof schema.orderItems>) {
    await this.library.reorderNovels(user.id, body)
    return { updated: true }
  }

  @Get('novels/:id')
  @ApiDoc({ summary: '获取小说详情', type: ResourceResult })
  @ApiUuidParam()
  getNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.getNovel(user.id, params.id)
  }

  @Put('novels/:id')
  @ApiDoc({ summary: '完整更新小说', type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(UpdateNovelDto)
  updateNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }, @Body(new ZodPipe(schema.updateNovel)) body: schema.UpdateNovelInput) {
    return this.library.updateNovel(user.id, params.id, body)
  }

  @Delete('novels/:id')
  @ApiDoc({ summary: '删除小说及其从属内容', type: MutationResult })
  @ApiUuidParam()
  async deleteNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    await this.library.deleteNovel(user.id, params.id)
    return { deleted: true }
  }

  @Post('novels/:id/archive')
  @HttpCode(200)
  @ApiDoc({ summary: '归档小说', type: ResourceResult })
  @ApiUuidParam()
  archiveNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.setNovelStatus(user.id, params.id, 'archived')
  }

  @Post('novels/:id/restore')
  @HttpCode(200)
  @ApiDoc({ summary: '恢复已归档小说', type: ResourceResult })
  @ApiUuidParam()
  restoreNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.setNovelStatus(user.id, params.id, 'draft')
  }

  @Post('novels/:id/publish')
  @HttpCode(200)
  @ApiDoc({ summary: '发布小说', type: ResourceResult })
  @ApiUuidParam()
  publishNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.setNovelStatus(user.id, params.id, 'published')
  }

  @Delete('novels/:id/publish')
  @ApiDoc({ summary: '取消发布小说', type: ResourceResult })
  @ApiUuidParam()
  unpublishNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.setNovelStatus(user.id, params.id, 'draft')
  }

  @Get('novels/:id/published-chapters')
  @AllowAnonymous()
  @ApiDoc({ summary: '公开读取已发布小说与章节', type: ResourceResult, public: true })
  @ApiUuidParam()
  publishedNovel(@Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.publishedNovel(params.id)
  }

  @Get('novels/:id/volumes')
  @ApiDoc({ summary: '查询小说卷列表', type: ResourceResult, array: true })
  @ApiUuidParam()
  volumes(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.listVolumes(user.id, params.id)
  }

  @Get('novels/:id/chapters')
  @ApiDoc({ summary: '查询小说章节列表', type: ResourceResult, array: true })
  @ApiUuidParam()
  chapters(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.listChapters(user.id, params.id)
  }

  @Post('volumes')
  @ApiDoc({ summary: '创建卷', type: ResourceResult, status: 201 })
  @ApiZodBody(CreateVolumeDto)
  createVolume(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.createVolume)) body: schema.CreateVolumeInput) {
    return this.library.createVolume(user.id, body)
  }

  @Get('volumes/:id')
  @ApiDoc({ summary: '获取卷详情', type: ResourceResult })
  @ApiUuidParam()
  getVolume(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.getVolume(user.id, params.id)
  }

  @Put('volumes/:id')
  @ApiDoc({ summary: '更新卷', type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(UpdateVolumeDto)
  updateVolume(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }, @Body(new ZodPipe(schema.updateVolume)) body: schema.UpdateVolumeInput) {
    return this.library.updateVolume(user.id, params.id, body)
  }

  @Delete('volumes/:id')
  @ApiDoc({ summary: '删除卷', type: MutationResult })
  @ApiUuidParam()
  async deleteVolume(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    await this.library.deleteVolume(user.id, params.id)
    return { deleted: true }
  }

  @Post('volumes/reorder')
  @HttpCode(200)
  @ApiDoc({ summary: '批量调整卷排序', type: MutationResult })
  @ApiZodBody(OrderItemsDto)
  async reorderVolumes(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.orderItems)) body: z.infer<typeof schema.orderItems>) {
    await this.library.reorderVolumes(user.id, body)
    return { updated: true }
  }

  @Get('volumes/:id/chapters')
  @ApiDoc({ summary: '查询指定卷的章节', type: ResourceResult, array: true })
  @ApiUuidParam('id', '卷 UUID')
  async volumeChapters(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    const volume = await this.library.getVolume(user.id, params.id)
    return this.library.listChapters(user.id, volume.novel_id, volume.id)
  }

  @Post('chapters')
  @ApiDoc({ summary: '创建章节', type: ResourceResult, status: 201 })
  @ApiZodBody(CreateChapterDto)
  createChapter(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.createChapter)) body: schema.CreateChapterInput) {
    return this.library.createChapter(user.id, body)
  }

  @Get('chapters/:id')
  @ApiDoc({ summary: '获取章节详情', type: ResourceResult })
  @ApiUuidParam()
  getChapter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.getChapter(user.id, params.id)
  }

  @Put('chapters/:id')
  @ApiDoc({ summary: '更新章节', type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(UpdateChapterDto)
  updateChapter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }, @Body(new ZodPipe(schema.updateChapter)) body: schema.UpdateChapterInput) {
    return this.library.updateChapter(user.id, params.id, body)
  }

  @Delete('chapters/:id')
  @ApiDoc({ summary: '删除章节', type: MutationResult })
  @ApiUuidParam()
  async deleteChapter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    await this.library.deleteChapter(user.id, params.id)
    return { deleted: true }
  }

  @Post('chapters/:id/publish')
  @HttpCode(200)
  @ApiDoc({ summary: '发布章节', type: ResourceResult })
  @ApiUuidParam()
  publishChapter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.publishChapter(user.id, params.id, true)
  }

  @Delete('chapters/:id/publish')
  @ApiDoc({ summary: '取消发布章节', type: ResourceResult })
  @ApiUuidParam()
  unpublishChapter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.publishChapter(user.id, params.id, false)
  }

  @Post('chapters/reorder')
  @HttpCode(200)
  @ApiDoc({ summary: '批量调整章节排序', type: MutationResult })
  @ApiZodBody(OrderItemsDto)
  async reorderChapters(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.orderItems)) body: z.infer<typeof schema.orderItems>) {
    await this.library.reorderChapters(user.id, body)
    return { updated: true }
  }

  @Post('chapters/search')
  @HttpCode(200)
  @ApiDoc({ summary: '在小说内搜索章节', type: ResourceResult, array: true })
  @ApiZodBody(ChapterSearchDto)
  searchChapters(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.chapterSearch)) body: z.infer<typeof schema.chapterSearch>) {
    return this.library.searchChapters(user.id, body)
  }

  @Get('novels/:id/characters')
  @ApiDoc({ summary: '查询小说角色', type: ResourceResult, array: true })
  @ApiUuidParam('id', '小说 UUID')
  characters(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.listCharacters(user.id, params.id)
  }

  @Post('characters')
  @ApiDoc({ summary: '创建角色', type: ResourceResult, status: 201 })
  @ApiZodBody(CreateCharacterDto)
  createCharacter(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.createCharacter)) body: schema.CreateCharacterInput) {
    return this.library.createCharacter(user.id, body)
  }

  @Put('characters/:id')
  @ApiDoc({ summary: '更新角色', type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(UpdateCharacterDto)
  updateCharacter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }, @Body(new ZodPipe(schema.updateCharacter)) body: schema.UpdateCharacterInput) {
    return this.library.updateCharacter(user.id, params.id, body)
  }

  @Delete('characters/:id')
  @ApiDoc({ summary: '删除角色', type: MutationResult })
  @ApiUuidParam()
  async deleteCharacter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    await this.library.deleteCharacter(user.id, params.id)
    return { deleted: true }
  }

  @Get('novels/:id/relationships')
  @ApiDoc({ summary: '查询小说角色关系', type: ResourceResult, array: true })
  @ApiUuidParam('id', '小说 UUID')
  relationships(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.listRelationships(user.id, params.id)
  }

  @Post('relationships')
  @ApiDoc({ summary: '创建角色关系', type: ResourceResult, status: 201 })
  @ApiZodBody(CreateRelationshipDto)
  createRelationship(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.createRelationship)) body: schema.CreateRelationshipInput) {
    return this.library.createRelationship(user.id, body)
  }

  @Put('relationships/:id')
  @ApiDoc({ summary: '更新角色关系', type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(UpdateRelationshipDto)
  updateRelationship(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }, @Body(new ZodPipe(schema.updateRelationship)) body: schema.UpdateRelationshipInput) {
    return this.library.updateRelationship(user.id, params.id, body)
  }

  @Delete('relationships/:id')
  @ApiDoc({ summary: '删除角色关系', type: MutationResult })
  @ApiUuidParam()
  async deleteRelationship(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    await this.library.deleteRelationship(user.id, params.id)
    return { deleted: true }
  }
}
