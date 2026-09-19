import type { AuthUser } from '../common/current-user.js'
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { CurrentUser } from '../common/current-user.js'
import { ZodPipe } from '../common/zod-pipe.js'
import { ApiDoc, ApiUuidParam, ApiZodBody } from '../openapi/api-doc.js'
import { MutationResult, ResourceResult } from '../openapi/api-model.js'
import {
  CreateOutlineDto,
  CreatePlanDto,
  CreateTimelineDto,
  CreateWorldbookDto,
  UpdateOutlineDto,
  UpdatePlanDto,
  UpdateTimelineDto,
  UpdateWorldbookDto,
} from './planning.dto.js'
import * as s from './planning.schema.js'
import { PlanningService } from './planning.service.js'

const idParam = z.object({ id: z.uuid() })

@Controller('editor')
@ApiTags('写作规划')
export class PlanningController {
  constructor(@Inject(PlanningService) private readonly planning: PlanningService) {}

  @Get('novels/:id/worldbook')
  @ApiDoc({ summary: '查询小说世界观条目', type: ResourceResult, array: true })
  @ApiUuidParam('id', '小说 UUID')
  @ApiQuery({ name: 'category', required: false, enum: ['setting', 'location', 'item', 'faction', 'event', 'rule', 'character_lore', 'other'] })
  listWorldbook(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Query(new ZodPipe(s.novelQuery)) q: z.infer<typeof s.novelQuery>) {
    return this.planning.listWorldbook(user.id, p.id, q.category)
  }

  @Post('novels/:id/worldbook')
  @ApiDoc({ summary: '创建世界观条目', type: ResourceResult, status: 201 })
  @ApiUuidParam('id', '小说 UUID')
  @ApiZodBody(CreateWorldbookDto)
  createWorldbook(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.createWorldbook.omit({ novel_id: true }))) body: Omit<s.CreateWorldbook, 'novel_id'>) {
    return this.planning.createWorldbook(user.id, { ...body, novel_id: p.id })
  }

  @Patch('worldbook/:id')
  @ApiDoc({ summary: '更新世界观条目', type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(UpdateWorldbookDto)
  updateWorldbook(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.updateWorldbook)) body: s.UpdateWorldbook) {
    return this.planning.updateWorldbook(user.id, p.id, body)
  }

  @Delete('worldbook/:id')
  @ApiDoc({ summary: '删除世界观条目', type: MutationResult })
  @ApiUuidParam()
  async deleteWorldbook(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }) {
    await this.planning.deleteWorldbook(user.id, p.id)
    return { deleted: true }
  }

  @Get('novels/:id/outlines')
  @ApiDoc({ summary: '查询小说大纲', type: ResourceResult, array: true })
  @ApiUuidParam('id', '小说 UUID')
  @ApiQuery({ name: 'volumeId', required: false, type: String, format: 'uuid', description: '按卷过滤' })
  @ApiQuery({ name: 'parentId', required: false, type: String, format: 'uuid', nullable: true, description: '按父节点过滤' })
  listOutlines(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Query(new ZodPipe(s.novelQuery)) q: z.infer<typeof s.novelQuery>) {
    return this.planning.listOutlines(user.id, p.id, q)
  }

  @Post('novels/:id/outlines')
  @ApiDoc({ summary: '创建大纲节点', type: ResourceResult, status: 201 })
  @ApiUuidParam('id', '小说 UUID')
  @ApiZodBody(CreateOutlineDto)
  createOutline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.createOutline.omit({ novel_id: true }))) body: Omit<s.CreateOutline, 'novel_id'>) {
    return this.planning.createOutline(user.id, { ...body, novel_id: p.id })
  }

  @Patch('outlines/:id')
  @ApiDoc({ summary: '更新大纲节点', type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(UpdateOutlineDto)
  updateOutline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.updateOutline)) body: s.UpdateOutline) {
    return this.planning.updateOutline(user.id, p.id, body)
  }

  @Delete('outlines/:id')
  @ApiDoc({ summary: '删除大纲节点', type: MutationResult })
  @ApiUuidParam()
  async deleteOutline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }) {
    await this.planning.deleteOutline(user.id, p.id)
    return { deleted: true }
  }

  @Get('novels/:id/plan-files')
  @ApiDoc({ summary: '查询规划文件', type: ResourceResult, array: true })
  @ApiUuidParam('id', '小说 UUID')
  listPlans(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }) {
    return this.planning.listPlans(user.id, p.id)
  }

  @Post('novels/:id/plan-files')
  @ApiDoc({ summary: '创建规划文件', type: ResourceResult, status: 201 })
  @ApiUuidParam('id', '小说 UUID')
  @ApiZodBody(CreatePlanDto)
  createPlan(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.createPlan.omit({ novel_id: true }))) body: Omit<s.CreatePlan, 'novel_id'>) {
    return this.planning.createPlan(user.id, { ...body, novel_id: p.id })
  }

  @Patch('plan-files/:id')
  @ApiDoc({ summary: '更新规划文件', type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(UpdatePlanDto)
  updatePlan(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.updatePlan)) body: s.UpdatePlan) {
    return this.planning.updatePlan(user.id, p.id, body)
  }

  @Delete('plan-files/:id')
  @ApiDoc({ summary: '删除规划文件', type: MutationResult })
  @ApiUuidParam()
  async deletePlan(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }) {
    await this.planning.deletePlan(user.id, p.id)
    return { deleted: true }
  }

  @Get('novels/:id/timeline')
  @ApiDoc({ summary: '查询小说时间线', type: ResourceResult, array: true })
  @ApiUuidParam('id', '小说 UUID')
  listTimeline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }) {
    return this.planning.listTimeline(user.id, p.id)
  }

  @Get('characters/:id/timeline')
  @ApiDoc({ summary: '查询角色时间线', type: ResourceResult, array: true })
  @ApiUuidParam('id', '角色 UUID')
  @ApiQuery({ name: 'novelId', required: true, type: String, format: 'uuid', description: '小说 UUID' })
  async characterTimeline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Query('novelId') novelId: string) {
    return this.planning.listTimeline(user.id, z.uuid().parse(novelId), p.id)
  }

  @Post('novels/:id/timeline')
  @ApiDoc({ summary: '创建时间线事件', type: ResourceResult, status: 201 })
  @ApiUuidParam('id', '小说 UUID')
  @ApiZodBody(CreateTimelineDto)
  createTimeline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.createTimeline.omit({ novel_id: true }))) body: Omit<s.CreateTimeline, 'novel_id'>) {
    return this.planning.createTimeline(user.id, { ...body, novel_id: p.id })
  }

  @Patch('timeline-events/:id')
  @ApiDoc({ summary: '更新时间线事件', type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(UpdateTimelineDto)
  updateTimeline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.updateTimeline)) body: s.UpdateTimeline) {
    return this.planning.updateTimeline(user.id, p.id, body)
  }

  @Delete('timeline-events/:id')
  @ApiDoc({ summary: '删除时间线事件', type: MutationResult })
  @ApiUuidParam()
  async deleteTimeline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }) {
    await this.planning.deleteTimeline(user.id, p.id)
    return { deleted: true }
  }
}
