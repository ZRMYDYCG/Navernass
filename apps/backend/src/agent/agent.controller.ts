import type { Request, Response } from "express";
import type { AuthUser } from "../common/current-user.js";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { ApiProduces, ApiQuery, ApiTags } from "@nestjs/swagger";
import { pipeUIMessageStreamToResponse } from "ai";
import { z } from "zod";
import { ApiResult } from "../common/api-result.js";
import { AppError } from "../common/app-error.js";
import { CurrentUser } from "../common/current-user.js";
import { LongTask, RawResponse } from "../common/raw-response.js";
import { ZodPipe } from "../common/zod-pipe.js";
import {
  ApiDoc,
  ApiPageQuery,
  ApiStreamDoc,
  ApiUuidParam,
  ApiZodBody,
} from "../openapi/api-doc.js";
import { MutationResult, ResourceResult } from "../openapi/api-model.js";
import {
  CreateProviderDto,
  RunAgentDto,
  SaveMemoryDto,
  SearchMemoryDto,
  StructuredAgentDto,
  SyncMemoryDto,
  UpdateProviderDto,
  UpdateSessionDto,
} from "./agent.dto.js";
import * as schema from "./agent.schema.js";
import { ChatService } from "./chat.service.js";
import { MemoryService } from "./memory.service.js";
import { ModelService } from "./model.service.js";
import { ProviderService } from "./provider.service.js";
import { RuntimeService } from "./runtime.service.js";
import { TraceService } from "./trace.service.js";
import { VectorService } from "./vector.service.js";

const idParam = z.object({ id: z.uuid() });

@Controller("agent")
@ApiTags("Agent 基础设施")
export class AgentController {
  constructor(
    @Inject(ProviderService) private readonly providers: ProviderService,
    @Inject(ModelService) private readonly models: ModelService,
    @Inject(RuntimeService) private readonly runtime: RuntimeService,
    @Inject(MemoryService) private readonly memories: MemoryService,
    @Inject(ChatService) private readonly chats: ChatService,
    @Inject(TraceService) private readonly traces: TraceService,
    @Inject(VectorService) private readonly vectors: VectorService,
  ) {}

  @Get("manifest")
  @ApiDoc({ summary: "获取 Agent-native 能力清单", type: ResourceResult })
  manifest() {
    return {
      protocolVersion: "1.0",
      runtime: "Vercel AI SDK 7",
      transports: ["rest", "ai-sdk-ui-message-stream-v1"],
      roles: schema.agentRole.options,
      tools: [
        "getNovelSnapshot",
        "getChapter",
        "readArticle",
        "searchArticle",
        "proposeArticleEdit",
        "searchMemory",
        "saveMemory",
        "validateContinuity",
        "delegateSubagent",
      ],
      outputs: ["text", "chapterPlan", "characterProfile", "continuityReview"],
      context: ["userId", "novelId", "chapterId", "sessionId", "providerId", "mode", "skillIds"],
      skills: {
        format: "apps/backend/skills/<name>/SKILL.md",
        loading: "progressive-disclosure",
        tools: ["loadSkill", "readSkillResource"],
        runSnapshot: true,
      },
      reliability: {
        providerRetries: "exponential-backoff-with-retry-after",
        toolRetries: "idempotent-read-tools-only",
        writeToolRetries: false,
        errorEnvelope: true,
      },
    };
  }

  @Get("providers")
  @ApiDoc({ summary: "查询当前用户模型配置", type: ResourceResult, array: true })
  listProviders(@CurrentUser() user: AuthUser) {
    return this.providers.list(user.id);
  }

  @Post("providers")
  @ApiDoc({
    summary: "创建加密模型配置",
    description: "API Key 使用 AES-256-GCM 加密后落库，响应永不返回密钥。",
    type: ResourceResult,
    status: 201,
  })
  @ApiZodBody(CreateProviderDto)
  createProvider(
    @CurrentUser() user: AuthUser,
    @Body(new ZodPipe(schema.createProvider)) body: schema.CreateProvider,
  ) {
    return this.providers.create(user.id, body);
  }

  @Patch("providers/:id")
  @ApiDoc({ summary: "更新模型配置", type: ResourceResult })
  @ApiUuidParam("id", "模型配置 UUID")
  @ApiZodBody(UpdateProviderDto)
  updateProvider(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(idParam)) params: { id: string },
    @Body(new ZodPipe(schema.updateProvider)) body: schema.UpdateProvider,
  ) {
    return this.providers.update(user.id, params.id, body);
  }

  @Delete("providers/:id")
  @ApiDoc({ summary: "删除未被执行记录引用的模型配置", type: MutationResult })
  @ApiUuidParam("id", "模型配置 UUID")
  async deleteProvider(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(idParam)) params: { id: string },
  ) {
    await this.providers.remove(user.id, params.id);
    return { deleted: true };
  }

  @Post("providers/:id/test")
  @HttpCode(200)
  @LongTask()
  @ApiDoc({ summary: "测试模型连通性", type: ResourceResult })
  @ApiUuidParam("id", "模型配置 UUID")
  testProvider(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) params: { id: string }) {
    return this.models.test(user.id, params.id);
  }

  @Post("runs")
  @HttpCode(200)
  @LongTask()
  @ApiDoc({
    summary: "执行主 Agent 或指定 Subagent",
    description: "支持多步 Tool Loop、动态 RAG、Subagent 委派和完整执行追踪。",
    type: ResourceResult,
  })
  @ApiZodBody(RunAgentDto)
  run(
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
    @Body(new ZodPipe(schema.runAgent)) body: schema.RunAgent,
  ) {
    const controller = new AbortController();
    request.once("aborted", () => controller.abort());
    return this.runtime.generate(user.id, body, controller.signal);
  }

  @Post("runs/stream")
  @HttpCode(200)
  @LongTask()
  @RawResponse()
  @ApiProduces("text/event-stream")
  @ApiStreamDoc(
    "流式执行主 Agent 或指定 Subagent",
    "原样返回 Vercel AI SDK UI Message Stream v1，可直接由 AI SDK UI 客户端消费，包含文本、步骤、工具参数与工具结果。",
  )
  @ApiZodBody(RunAgentDto)
  async stream(
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
    @Res() response: Response,
    @Body(new ZodPipe(schema.runAgent)) body: schema.RunAgent,
  ) {
    const controller = new AbortController();
    request.once("aborted", () => controller.abort());
    response.once("close", () => controller.abort());
    const result = await this.runtime.stream(user.id, body, controller.signal);
    await pipeUIMessageStreamToResponse({ response, stream: result.stream });
  }

  @Post("runs/structured")
  @HttpCode(200)
  @LongTask()
  @ApiDoc({
    summary: "执行结构化生成",
    description: "支持章节规划、角色档案和一致性审查三类 Zod 强校验输出。",
    type: ResourceResult,
  })
  @ApiZodBody(StructuredAgentDto)
  structured(
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
    @Body(new ZodPipe(schema.structuredAgent)) body: schema.StructuredAgent,
  ) {
    const controller = new AbortController();
    request.once("aborted", () => controller.abort());
    return this.runtime.structured(user.id, body, controller.signal);
  }

  @Get("runs")
  @ApiDoc({ summary: "分页查询 Agent 执行记录", type: ResourceResult, array: true, paged: true })
  @ApiPageQuery()
  @ApiQuery({ name: "novelId", required: false, type: String, format: "uuid" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["queued", "running", "completed", "failed", "cancelled"],
  })
  async listRuns(
    @CurrentUser() user: AuthUser,
    @Query(new ZodPipe(schema.runQuery)) query: z.infer<typeof schema.runQuery>,
  ) {
    const result = await this.traces.listRuns(user.id, query);
    return ApiResult.page(result.data, {
      page: query.page,
      pageSize: query.pageSize,
      total: result.total,
    });
  }

  @Get("sessions")
  @ApiDoc({
    summary: "按小说分页查询聊天会话",
    description: "每个会话返回消息数量和最后一条消息摘要。",
    type: ResourceResult,
    array: true,
    paged: true,
  })
  @ApiPageQuery()
  @ApiQuery({
    name: "novelId",
    required: true,
    type: String,
    format: "uuid",
    description: "小说 UUID",
  })
  async listSessions(
    @CurrentUser() user: AuthUser,
    @Query(new ZodPipe(schema.sessionQuery)) query: schema.SessionQuery,
  ) {
    const result = await this.chats.listSessions(user.id, query);
    return ApiResult.page(result.data, {
      page: query.page,
      pageSize: query.pageSize,
      total: result.total,
    });
  }

  @Get("sessions/:id/messages")
  @ApiDoc({
    summary: "游标分页查询会话消息",
    description:
      "消息按时间正序返回，parts 保留 Vercel AI SDK UIMessage 的文本、工具调用和工具结果结构。",
    type: ResourceResult,
  })
  @ApiUuidParam("id", "聊天会话 UUID")
  @ApiQuery({
    name: "cursor",
    required: false,
    type: String,
    description: "上一页返回的 nextCursor",
  })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 50 })
  listMessages(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(idParam)) params: { id: string },
    @Query(new ZodPipe(schema.messageQuery)) query: schema.MessageQuery,
  ) {
    return this.chats.listMessages(user.id, params.id, query);
  }

  @Patch("sessions/:id")
  @ApiDoc({ summary: "重命名聊天会话", type: ResourceResult })
  @ApiUuidParam("id", "聊天会话 UUID")
  @ApiZodBody(UpdateSessionDto)
  updateSession(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(idParam)) params: { id: string },
    @Body(new ZodPipe(schema.updateSession)) body: schema.UpdateSession,
  ) {
    return this.chats.updateSession(user.id, params.id, body.title);
  }

  @Delete("sessions/:id")
  @ApiDoc({ summary: "删除聊天会话及其全部消息", type: MutationResult })
  @ApiUuidParam("id", "聊天会话 UUID")
  async deleteSession(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(idParam)) params: { id: string },
  ) {
    await this.chats.removeSession(user.id, params.id);
    return { deleted: true };
  }

  @Get("runs/:id")
  @ApiDoc({ summary: "获取执行详情、步骤和工具调用", type: ResourceResult })
  @ApiUuidParam("id", "执行记录 UUID")
  async getRun(@CurrentUser() user: AuthUser, @Param(new ZodPipe(idParam)) params: { id: string }) {
    const run = await this.traces.getRun(user.id, params.id);
    if (!run) throw AppError.notFound("AGENT_RUN_NOT_FOUND", "Agent 执行记录");
    return run;
  }

  @Post("memories")
  @ApiDoc({ summary: "写入或更新语义记忆", type: ResourceResult, status: 201 })
  @ApiZodBody(SaveMemoryDto)
  saveMemory(
    @CurrentUser() user: AuthUser,
    @Body(new ZodPipe(schema.saveMemory)) body: schema.SaveMemory,
  ) {
    return this.memories.save(user.id, body);
  }

  @Post("memories/search")
  @HttpCode(200)
  @ApiDoc({
    summary: "混合检索小说记忆",
    description: "合并 Qdrant 向量相似度和 MySQL 关键词命中并重排。",
    type: ResourceResult,
    array: true,
  })
  @ApiZodBody(SearchMemoryDto)
  searchMemory(
    @CurrentUser() user: AuthUser,
    @Body(new ZodPipe(schema.searchMemory)) body: schema.SearchMemory,
  ) {
    return this.memories.search(user.id, body);
  }

  @Post("memories/sync")
  @HttpCode(200)
  @LongTask()
  @ApiDoc({ summary: "把小说结构化资料同步到语义记忆", type: ResourceResult })
  @ApiZodBody(SyncMemoryDto)
  syncMemory(
    @CurrentUser() user: AuthUser,
    @Body(new ZodPipe(schema.syncMemory)) body: schema.SyncMemory,
  ) {
    return this.memories.sync(user.id, body);
  }

  @Get("vector-health")
  @ApiDoc({ summary: "检查当前向量库连接", type: ResourceResult })
  vectorHealth() {
    return this.vectors.health();
  }
}
