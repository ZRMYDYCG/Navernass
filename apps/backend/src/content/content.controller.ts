import type { AuthRequest, AuthUser } from "../common/current-user.js";
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous, OptionalAuth } from "@thallesp/nestjs-better-auth";
import { z } from "zod";
import { ApiResult } from "../common/api-result.js";
import { CurrentUser } from "../common/current-user.js";
import { RoleRoute } from "../common/role-route.js";
import { ZodPipe } from "../common/zod-pipe.js";
import { ApiDoc, ApiPageQuery, ApiUuidParam, ApiZodBody } from "../openapi/api-doc.js";
import { MutationResult, ResourceResult } from "../openapi/api-model.js";
import {
  CreateNewsDto,
  CreateSurveyDto,
  CreateTodoDto,
  CreateWallDto,
  UpdateNewsDto,
  UpdateTodoDto,
} from "./content.dto.js";
import * as s from "./content.schema.js";
import { ContentService } from "./content.service.js";

const idParam = z.object({ id: z.uuid() });
const todoDelete = z.object({ id: z.uuid() });

@Controller()
@ApiTags("内容与社区")
export class ContentController {
  constructor(@Inject(ContentService) private readonly content: ContentService) {}

  @Get("news")
  @AllowAnonymous()
  @ApiDoc({
    summary: "分页查询新闻公告",
    type: ResourceResult,
    array: true,
    paged: true,
    public: true,
  })
  @ApiPageQuery()
  @ApiQuery({
    name: "type",
    required: false,
    enum: ["feature", "update", "announcement", "community"],
  })
  @ApiQuery({ name: "status", required: false, enum: ["draft", "published", "archived"] })
  async news(@Query(new ZodPipe(s.newsQuery)) query: z.infer<typeof s.newsQuery>) {
    const result = await this.content.listNews(query);
    return ApiResult.page(result.data, {
      page: query.page,
      pageSize: query.pageSize,
      total: result.total,
    });
  }

  @Get("news/:id")
  @AllowAnonymous()
  @ApiDoc({ summary: "获取新闻公告详情", type: ResourceResult, public: true })
  @ApiUuidParam()
  newsItem(@Param(new ZodPipe(idParam)) params: { id: string }) {
    return this.content.getNews(params.id);
  }

  @Post("news")
  @RoleRoute("super_admin")
  @ApiDoc({ summary: "创建新闻公告（管理员）", type: ResourceResult, status: 201 })
  @ApiZodBody(CreateNewsDto)
  createNews(@Body(new ZodPipe(s.createNews)) body: s.CreateNews) {
    return this.content.createNews(body);
  }

  @Patch("news/:id")
  @RoleRoute("super_admin")
  @ApiDoc({ summary: "更新新闻公告（管理员）", type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(UpdateNewsDto)
  updateNews(
    @Param(new ZodPipe(idParam)) params: { id: string },
    @Body(new ZodPipe(s.updateNews)) body: s.UpdateNews,
  ) {
    return this.content.updateNews(params.id, body);
  }

  @Delete("news/:id")
  @RoleRoute("super_admin")
  @ApiDoc({ summary: "删除新闻公告（管理员）", type: MutationResult })
  @ApiUuidParam()
  async deleteNews(@Param(new ZodPipe(idParam)) params: { id: string }) {
    await this.content.deleteNews(params.id);
    return { deleted: true };
  }

  @Post("surveys")
  @OptionalAuth()
  @ApiDoc({
    summary: "提交用户调研",
    description: "支持匿名提交；登录后会关联当前用户。",
    type: ResourceResult,
    status: 201,
    public: true,
  })
  @ApiZodBody(CreateSurveyDto)
  submitSurvey(
    @Req() request: AuthRequest,
    @Body(new ZodPipe(s.createSurvey)) body: s.CreateSurvey,
  ) {
    const user = request.user ?? (request.session as { user?: AuthUser } | undefined)?.user;
    return this.content.createSurvey(user?.id ?? null, body);
  }

  @Get("todos")
  @ApiDoc({ summary: "获取当前用户待办事项", type: ResourceResult, array: true })
  todos(@CurrentUser() user: AuthUser) {
    return this.content.listTodos(user.id);
  }

  @Post("todos")
  @ApiDoc({ summary: "创建待办事项", type: ResourceResult, status: 201 })
  @ApiZodBody(CreateTodoDto)
  createTodo(@CurrentUser() user: AuthUser, @Body(new ZodPipe(s.createTodo)) body: s.CreateTodo) {
    return this.content.createTodo(user.id, body);
  }

  @Patch("todos")
  @ApiDoc({ summary: "更新待办事项", type: ResourceResult })
  @ApiZodBody(UpdateTodoDto)
  updateTodo(@CurrentUser() user: AuthUser, @Body(new ZodPipe(s.updateTodo)) body: s.UpdateTodo) {
    return this.content.updateTodo(user.id, body);
  }

  @Delete("todos")
  @ApiDoc({ summary: "删除待办事项", type: MutationResult })
  @ApiQuery({
    name: "id",
    required: true,
    type: String,
    format: "uuid",
    description: "待办事项 UUID",
  })
  async deleteTodo(
    @CurrentUser() user: AuthUser,
    @Query(new ZodPipe(todoDelete)) query: { id: string },
  ) {
    await this.content.deleteTodo(user.id, query.id);
    return { deleted: true };
  }

  @Get("message-wall")
  @AllowAnonymous()
  @ApiDoc({
    summary: "分页查询留言墙",
    type: ResourceResult,
    array: true,
    paged: true,
    public: true,
  })
  @ApiPageQuery()
  wall(@Query(new ZodPipe(s.pageQuery)) query: z.infer<typeof s.pageQuery>) {
    return this.content.listWall(query.page, query.pageSize);
  }

  @Post("message-wall")
  @AllowAnonymous()
  @ApiDoc({ summary: "发布留言", type: ResourceResult, status: 201, public: true })
  @ApiZodBody(CreateWallDto)
  createWall(@Body(new ZodPipe(s.createWall)) body: s.CreateWall) {
    return this.content.createWall(body);
  }
}
