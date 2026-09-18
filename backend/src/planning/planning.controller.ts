import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { z } from 'zod'
import { CurrentUser, type AuthUser } from '../common/current-user.js'
import { ZodPipe } from '../common/zod-pipe.js'
import { PlanningService } from './planning.service.js'
import * as s from './planning.schema.js'

const idParam = z.object({ id: z.uuid() })

@Controller('editor')
export class PlanningController {
  constructor(private readonly planning: PlanningService) {}

  @Get('novels/:id/worldbook')
  listWorldbook(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Query(new ZodPipe(s.novelQuery)) q: z.infer<typeof s.novelQuery>) {
    return this.planning.listWorldbook(user.id, p.id, q.category)
  }

  @Post('novels/:id/worldbook')
  createWorldbook(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.createWorldbook.omit({ novel_id: true }))) body: Omit<s.CreateWorldbook, 'novel_id'>) {
    return this.planning.createWorldbook(user.id, { ...body, novel_id: p.id })
  }

  @Patch('worldbook/:id')
  updateWorldbook(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.updateWorldbook)) body: s.UpdateWorldbook) {
    return this.planning.updateWorldbook(user.id, p.id, body)
  }

  @Delete('worldbook/:id')
  async deleteWorldbook(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }) {
    await this.planning.deleteWorldbook(user.id, p.id)
    return { deleted: true }
  }

  @Get('novels/:id/outlines')
  listOutlines(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Query(new ZodPipe(s.novelQuery)) q: z.infer<typeof s.novelQuery>) {
    return this.planning.listOutlines(user.id, p.id, q)
  }

  @Post('novels/:id/outlines')
  createOutline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.createOutline.omit({ novel_id: true }))) body: Omit<s.CreateOutline, 'novel_id'>) {
    return this.planning.createOutline(user.id, { ...body, novel_id: p.id })
  }

  @Patch('outlines/:id')
  updateOutline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.updateOutline)) body: s.UpdateOutline) {
    return this.planning.updateOutline(user.id, p.id, body)
  }

  @Delete('outlines/:id')
  async deleteOutline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }) {
    await this.planning.deleteOutline(user.id, p.id)
    return { deleted: true }
  }

  @Get('novels/:id/plan-files')
  listPlans(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }) {
    return this.planning.listPlans(user.id, p.id)
  }

  @Post('novels/:id/plan-files')
  createPlan(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.createPlan.omit({ novel_id: true }))) body: Omit<s.CreatePlan, 'novel_id'>) {
    return this.planning.createPlan(user.id, { ...body, novel_id: p.id })
  }

  @Patch('plan-files/:id')
  updatePlan(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.updatePlan)) body: s.UpdatePlan) {
    return this.planning.updatePlan(user.id, p.id, body)
  }

  @Delete('plan-files/:id')
  async deletePlan(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }) {
    await this.planning.deletePlan(user.id, p.id)
    return { deleted: true }
  }

  @Get('novels/:id/timeline')
  listTimeline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }) {
    return this.planning.listTimeline(user.id, p.id)
  }

  @Get('characters/:id/timeline')
  async characterTimeline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Query('novelId') novelId: string) {
    return this.planning.listTimeline(user.id, z.uuid().parse(novelId), p.id)
  }

  @Post('novels/:id/timeline')
  createTimeline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.createTimeline.omit({ novel_id: true }))) body: Omit<s.CreateTimeline, 'novel_id'>) {
    return this.planning.createTimeline(user.id, { ...body, novel_id: p.id })
  }

  @Patch('timeline-events/:id')
  updateTimeline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }, @Body(new ZodPipe(s.updateTimeline)) body: s.UpdateTimeline) {
    return this.planning.updateTimeline(user.id, p.id, body)
  }

  @Delete('timeline-events/:id')
  async deleteTimeline(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) p: { id: string }) {
    await this.planning.deleteTimeline(user.id, p.id)
    return { deleted: true }
  }
}
