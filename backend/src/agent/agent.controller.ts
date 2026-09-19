import type { Request, Response } from 'express'
import type { AuthUser } from '../common/current-user.js'
import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Query, Req, Res } from '@nestjs/common'
import { ApiProduces, ApiQuery, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { ApiResult } from '../common/api-result.js'
import { AppError } from '../common/app-error.js'
import { CurrentUser } from '../common/current-user.js'
import { LongTask, RawResponse } from '../common/raw-response.js'
import { ZodPipe } from '../common/zod-pipe.js'
import { ApiDoc, ApiPageQuery, ApiStreamDoc, ApiUuidParam, ApiZodBody } from '../openapi/api-doc.js'
import { MutationResult, ResourceResult } from '../openapi/api-model.js'
import {
  CreateProviderDto,
  RunAgentDto,
  SaveMemoryDto,
  SearchMemoryDto,
  StructuredAgentDto,
  SyncMemoryDto,
  UpdateProviderDto,
} from './agent.dto.js'
import * as schema from './agent.schema.js'
import { MemoryService } from './memory.service.js'
import { ModelService } from './model.service.js'
import { ProviderService } from './provider.service.js'
import { RuntimeService } from './runtime.service.js'
import { TraceService } from './trace.service.js'
import { VectorService } from './vector.service.js'

const idParam = z.object({ id: z.uuid() })

@Controller('agent')
@ApiTags('Agent 基础设施')
export class AgentController {
  constructor(
    @Inject(ProviderService) private readonly providers: ProviderService,
    @Inject(ModelService) private readonly models: ModelService,
    @Inject(RuntimeService) private readonly runtime: RuntimeService,
    @Inject(MemoryService) private readonly memories: MemoryService,
    @Inject(TraceService) private readonly traces: TraceService,
    @Inject(VectorService) private readonly vectors: VectorService,
  ) {}

  @Get('manifest')
  @ApiDoc({ summary: '获取 Agent-native 能力清单', type: ResourceResult })
  manifest() {
    return {
      protocolVersion: '1.0',
      runtime: 'Vercel AI SDK 7',
      transports: ['rest', 'sse'],
      roles: schema.agentRole.options,
      tools: ['getNovelSnapshot', 'getChapter', 'searchMemory', 'saveMemory', 'validateContinuity', 'delegateSubagent'],
      outputs: ['text', 'chapterPlan', 'characterProfile', 'continuityReview'],
      context: ['userId', 'novelId', 'chapterId', 'sessionId', 'providerId'],
    }
  }

  @Get('providers')
  @ApiDoc({ summary: '查询当前用户模型配置', type: ResourceResult, array: true })
  listProviders(@CurrentUser() user: AuthUser) {
    return this.providers.list(user.id)
  }

  @Post('providers')
  @ApiDoc({ summary: '创建加密模型配置', description: 'API Key 使用 AES-256-GCM 加密后落库，响应永不返回密钥。', type: ResourceResult, status: 201 })
  @ApiZodBody(CreateProviderDto)
  createProvider(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.createProvider)) body: schema.CreateProvider) {
    return this.providers.create(user.id, body)
  }

  @Patch('providers/:id')
  @ApiDoc({ summary: '更新模型配置', type: ResourceResult })
  @ApiUuidParam('id', '模型配置 UUID')
  @ApiZodBody(UpdateProviderDto)
  updateProvider(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) params: { id: string }, @Body(new ZodPipe(schema.updateProvider)) body: schema.UpdateProvider) {
    return this.providers.update(user.id, params.id, body)
  }

  @Delete('providers/:id')
  @ApiDoc({ summary: '删除未被执行记录引用的模型配置', type: MutationResult })
  @ApiUuidParam('id', '模型配置 UUID')
  async deleteProvider(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) params: { id: string }) {
    await this.providers.remove(user.id, params.id)
    return { deleted: true }
  }

  @Post('providers/:id/test')
  @HttpCode(200)
  @LongTask()
  @ApiDoc({ summary: '测试模型连通性', type: ResourceResult })
  @ApiUuidParam('id', '模型配置 UUID')
  testProvider(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) params: { id: string }) {
    return this.models.test(user.id, params.id)
  }

  @Post('runs')
  @HttpCode(200)
  @LongTask()
  @ApiDoc({ summary: '执行主 Agent 或指定 Subagent', description: '支持多步 Tool Loop、动态 RAG、Subagent 委派和完整执行追踪。', type: ResourceResult })
  @ApiZodBody(RunAgentDto)
  run(@CurrentUser() user: AuthUser, @Req() request: Request, @Body(new ZodPipe(schema.runAgent)) body: schema.RunAgent) {
    const controller = new AbortController()
    request.once('aborted', () => controller.abort())
    return this.runtime.generate(user.id, body, controller.signal)
  }

  @Post('runs/stream')
  @HttpCode(200)
  @LongTask()
  @RawResponse()
  @ApiProduces('text/event-stream')
  @ApiStreamDoc('流式执行主 Agent 或指定 Subagent', '连接建立后依次推送执行标识、文本增量、步骤和完成事件。')
  @ApiZodBody(RunAgentDto)
  async stream(
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
    @Res() response: Response,
    @Body(new ZodPipe(schema.runAgent)) body: schema.RunAgent,
  ) {
    response.status(200)
    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    response.setHeader('Cache-Control', 'no-cache, no-transform')
    response.setHeader('Connection', 'keep-alive')
    response.setHeader('X-Accel-Buffering', 'no')
    response.flushHeaders()
    const controller = new AbortController()
    request.once('aborted', () => controller.abort())
    response.once('close', () => controller.abort())
    const emit = (event: string, data: unknown) => response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    const heartbeat = setInterval(() => response.write(': heartbeat\n\n'), 15_000)
    try {
      await this.runtime.stream(user.id, body, emit, controller.signal)
    } finally {
      clearInterval(heartbeat)
      response.end()
    }
  }

  @Post('runs/structured')
  @HttpCode(200)
  @LongTask()
  @ApiDoc({ summary: '执行结构化生成', description: '支持章节规划、角色档案和一致性审查三类 Zod 强校验输出。', type: ResourceResult })
  @ApiZodBody(StructuredAgentDto)
  structured(@CurrentUser() user: AuthUser, @Req() request: Request, @Body(new ZodPipe(schema.structuredAgent)) body: schema.StructuredAgent) {
    const controller = new AbortController()
    request.once('aborted', () => controller.abort())
    return this.runtime.structured(user.id, body, controller.signal)
  }

  @Get('runs')
  @ApiDoc({ summary: '分页查询 Agent 执行记录', type: ResourceResult, array: true, paged: true })
  @ApiPageQuery()
  @ApiQuery({ name: 'novelId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'status', required: false, enum: ['queued', 'running', 'completed', 'failed', 'cancelled'] })
  async listRuns(@CurrentUser() user: AuthUser, @Query(new ZodPipe(schema.runQuery)) query: z.infer<typeof schema.runQuery>) {
    const result = await this.traces.listRuns(user.id, query)
    return ApiResult.page(result.data, { page: query.page, pageSize: query.pageSize, total: result.total })
  }

  @Get('runs/:id')
  @ApiDoc({ summary: '获取执行详情、步骤和工具调用', type: ResourceResult })
  @ApiUuidParam('id', '执行记录 UUID')
  async getRun(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) params: { id: string }) {
    const run = await this.traces.getRun(user.id, params.id)
    if (!run) throw AppError.notFound('AGENT_RUN_NOT_FOUND', 'Agent 执行记录')
    return run
  }

  @Post('memories')
  @ApiDoc({ summary: '写入或更新语义记忆', type: ResourceResult, status: 201 })
  @ApiZodBody(SaveMemoryDto)
  saveMemory(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.saveMemory)) body: schema.SaveMemory) {
    return this.memories.save(user.id, body)
  }

  @Post('memories/search')
  @HttpCode(200)
  @ApiDoc({ summary: '混合检索小说记忆', description: '合并 Qdrant 向量相似度和 MySQL 关键词命中并重排。', type: ResourceResult, array: true })
  @ApiZodBody(SearchMemoryDto)
  searchMemory(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.searchMemory)) body: schema.SearchMemory) {
    return this.memories.search(user.id, body)
  }

  @Post('memories/sync')
  @HttpCode(200)
  @LongTask()
  @ApiDoc({ summary: '把小说结构化资料同步到语义记忆', type: ResourceResult })
  @ApiZodBody(SyncMemoryDto)
  syncMemory(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.syncMemory)) body: schema.SyncMemory) {
    return this.memories.sync(user.id, body)
  }

  @Get('vector-health')
  @ApiDoc({ summary: '检查当前向量库连接', type: ResourceResult })
  vectorHealth() {
    return this.vectors.health()
  }
}
