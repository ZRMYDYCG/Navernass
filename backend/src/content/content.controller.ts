import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common'
import { AllowAnonymous, OptionalAuth } from '@thallesp/nestjs-better-auth'
import { z } from 'zod'
import { ApiResult } from '../common/api-result.js'
import { CurrentUser, type AuthRequest, type AuthUser } from '../common/current-user.js'
import { RoleRoute } from '../common/role-route.js'
import { ZodPipe } from '../common/zod-pipe.js'
import { ContentService } from './content.service.js'
import * as s from './content.schema.js'

const idParam = z.object({ id: z.uuid() })
const todoDelete = z.object({ id: z.uuid() })

@Controller()
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('news')
  @AllowAnonymous()
  async news(@Query(new ZodPipe(s.newsQuery)) query: z.infer<typeof s.newsQuery>) {
    const result = await this.content.listNews(query)
    return ApiResult.page(result.data, { page: query.page, pageSize: query.pageSize, total: result.total })
  }

  @Get('news/:id')
  @AllowAnonymous()
  newsItem(@Param(new ZodPipe(idParam)) params: { id: string }) {
    return this.content.getNews(params.id)
  }

  @Post('news')
  @RoleRoute('super_admin')
  createNews(@Body(new ZodPipe(s.createNews)) body: s.CreateNews) {
    return this.content.createNews(body)
  }

  @Patch('news/:id')
  @RoleRoute('super_admin')
  updateNews(@Param(new ZodPipe(idParam)) params: { id: string }, @Body(new ZodPipe(s.updateNews)) body: s.UpdateNews) {
    return this.content.updateNews(params.id, body)
  }

  @Delete('news/:id')
  @RoleRoute('super_admin')
  async deleteNews(@Param(new ZodPipe(idParam)) params: { id: string }) {
    await this.content.deleteNews(params.id)
    return { deleted: true }
  }

  @Post('surveys')
  @OptionalAuth()
  submitSurvey(@Req() request: AuthRequest, @Body(new ZodPipe(s.createSurvey)) body: s.CreateSurvey) {
    const user = request.user ?? (request.session as { user?: AuthUser } | undefined)?.user
    return this.content.createSurvey(user?.id ?? null, body)
  }

  @Get('todos')
  todos(@CurrentUser() user: AuthUser) {
    return this.content.listTodos(user.id)
  }

  @Post('todos')
  createTodo(@CurrentUser() user: AuthUser, @Body(new ZodPipe(s.createTodo)) body: s.CreateTodo) {
    return this.content.createTodo(user.id, body)
  }

  @Patch('todos')
  updateTodo(@CurrentUser() user: AuthUser, @Body(new ZodPipe(s.updateTodo)) body: s.UpdateTodo) {
    return this.content.updateTodo(user.id, body)
  }

  @Delete('todos')
  async deleteTodo(@CurrentUser() user: AuthUser, @Query(new ZodPipe(todoDelete)) query: { id: string }) {
    await this.content.deleteTodo(user.id, query.id)
    return { deleted: true }
  }

  @Get('message-wall')
  @AllowAnonymous()
  wall(@Query(new ZodPipe(s.pageQuery)) query: z.infer<typeof s.pageQuery>) {
    return this.content.listWall(query.page, query.pageSize)
  }

  @Post('message-wall')
  @AllowAnonymous()
  createWall(@Body(new ZodPipe(s.createWall)) body: s.CreateWall) {
    return this.content.createWall(body)
  }
}
