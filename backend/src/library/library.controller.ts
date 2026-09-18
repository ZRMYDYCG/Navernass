import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { z } from 'zod'
import { ApiResult } from '../common/api-result.js'
import { CurrentUser, type AuthUser } from '../common/current-user.js'
import { ZodPipe } from '../common/zod-pipe.js'
import { LibraryService } from './library.service.js'
import * as schema from './library.schema.js'

@Controller()
export class LibraryController {
  constructor(private readonly library: LibraryService) {}

  @Get('novels')
  async novels(@CurrentUser() user: AuthUser, @Query(new ZodPipe(schema.pageQuery)) query: z.infer<typeof schema.pageQuery>) {
    const result = await this.library.listNovels(user.id, query)
    return ApiResult.page(result.data, { ...query, total: result.total })
  }

  @Post('novels')
  createNovel(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.createNovel)) body: schema.CreateNovelInput) {
    return this.library.createNovel(user.id, body)
  }

  @Get('novels/archived')
  async archived(@CurrentUser() user: AuthUser) {
    const result = await this.library.listNovels(user.id, { page: 1, pageSize: 100, status: 'archived' })
    return result.data
  }

  @Post('novels/reorder')
  @HttpCode(200)
  async reorderNovels(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.orderItems)) body: z.infer<typeof schema.orderItems>) {
    await this.library.reorderNovels(user.id, body)
    return { updated: true }
  }

  @Get('novels/:id')
  getNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.getNovel(user.id, params.id)
  }

  @Put('novels/:id')
  updateNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }, @Body(new ZodPipe(schema.updateNovel)) body: schema.UpdateNovelInput) {
    return this.library.updateNovel(user.id, params.id, body)
  }

  @Delete('novels/:id')
  async deleteNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    await this.library.deleteNovel(user.id, params.id)
    return { deleted: true }
  }

  @Post('novels/:id/archive')
  @HttpCode(200)
  archiveNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.setNovelStatus(user.id, params.id, 'archived')
  }

  @Post('novels/:id/restore')
  @HttpCode(200)
  restoreNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.setNovelStatus(user.id, params.id, 'draft')
  }

  @Post('novels/:id/publish')
  @HttpCode(200)
  publishNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.setNovelStatus(user.id, params.id, 'published')
  }

  @Delete('novels/:id/publish')
  unpublishNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.setNovelStatus(user.id, params.id, 'draft')
  }

  @Get('novels/:id/published-chapters')
  @AllowAnonymous()
  publishedNovel(@Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.publishedNovel(params.id)
  }

  @Get('novels/:id/volumes')
  volumes(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.listVolumes(user.id, params.id)
  }

  @Get('novels/:id/chapters')
  chapters(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.listChapters(user.id, params.id)
  }

  @Post('volumes')
  createVolume(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.createVolume)) body: schema.CreateVolumeInput) {
    return this.library.createVolume(user.id, body)
  }

  @Get('volumes/:id')
  getVolume(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.getVolume(user.id, params.id)
  }

  @Put('volumes/:id')
  updateVolume(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }, @Body(new ZodPipe(schema.updateVolume)) body: schema.UpdateVolumeInput) {
    return this.library.updateVolume(user.id, params.id, body)
  }

  @Delete('volumes/:id')
  async deleteVolume(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    await this.library.deleteVolume(user.id, params.id)
    return { deleted: true }
  }

  @Post('volumes/reorder')
  @HttpCode(200)
  async reorderVolumes(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.orderItems)) body: z.infer<typeof schema.orderItems>) {
    await this.library.reorderVolumes(user.id, body)
    return { updated: true }
  }

  @Get('volumes/:id/chapters')
  async volumeChapters(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    const volume = await this.library.getVolume(user.id, params.id)
    return this.library.listChapters(user.id, volume.novel_id, volume.id)
  }

  @Post('chapters')
  createChapter(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.createChapter)) body: schema.CreateChapterInput) {
    return this.library.createChapter(user.id, body)
  }

  @Get('chapters/:id')
  getChapter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.getChapter(user.id, params.id)
  }

  @Put('chapters/:id')
  updateChapter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }, @Body(new ZodPipe(schema.updateChapter)) body: schema.UpdateChapterInput) {
    return this.library.updateChapter(user.id, params.id, body)
  }

  @Delete('chapters/:id')
  async deleteChapter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    await this.library.deleteChapter(user.id, params.id)
    return { deleted: true }
  }

  @Post('chapters/:id/publish')
  @HttpCode(200)
  publishChapter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.publishChapter(user.id, params.id, true)
  }

  @Delete('chapters/:id/publish')
  unpublishChapter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.publishChapter(user.id, params.id, false)
  }

  @Post('chapters/reorder')
  @HttpCode(200)
  async reorderChapters(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.orderItems)) body: z.infer<typeof schema.orderItems>) {
    await this.library.reorderChapters(user.id, body)
    return { updated: true }
  }

  @Post('chapters/search')
  @HttpCode(200)
  searchChapters(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.chapterSearch)) body: z.infer<typeof schema.chapterSearch>) {
    return this.library.searchChapters(user.id, body)
  }

  @Get('novels/:id/characters')
  characters(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.listCharacters(user.id, params.id)
  }

  @Post('characters')
  createCharacter(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.createCharacter)) body: schema.CreateCharacterInput) {
    return this.library.createCharacter(user.id, body)
  }

  @Put('characters/:id')
  updateCharacter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }, @Body(new ZodPipe(schema.updateCharacter)) body: schema.UpdateCharacterInput) {
    return this.library.updateCharacter(user.id, params.id, body)
  }

  @Delete('characters/:id')
  async deleteCharacter(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    await this.library.deleteCharacter(user.id, params.id)
    return { deleted: true }
  }

  @Get('novels/:id/relationships')
  relationships(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    return this.library.listRelationships(user.id, params.id)
  }

  @Post('relationships')
  createRelationship(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.createRelationship)) body: schema.CreateRelationshipInput) {
    return this.library.createRelationship(user.id, body)
  }

  @Put('relationships/:id')
  updateRelationship(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }, @Body(new ZodPipe(schema.updateRelationship)) body: schema.UpdateRelationshipInput) {
    return this.library.updateRelationship(user.id, params.id, body)
  }

  @Delete('relationships/:id')
  async deleteRelationship(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.idParams)) params: { id: string }) {
    await this.library.deleteRelationship(user.id, params.id)
    return { deleted: true }
  }
}
