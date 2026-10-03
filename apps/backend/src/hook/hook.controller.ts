import type { AuthUser } from "../common/current-user.js";
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiResult } from "../common/api-result.js";
import { CurrentUser } from "../common/current-user.js";
import { ZodPipe } from "../common/zod-pipe.js";
import { ApiDoc, ApiPageQuery, ApiUuidParam, ApiZodBody } from "../openapi/api-doc.js";
import { MutationResult, ResourceResult } from "../openapi/api-model.js";
import { CreateHookDto, UpdateHookDto } from "./hook.dto.js";
import * as schema from "./hook.schema.js";
import { HookService } from "./hook.service.js";

@Controller()
@ApiTags("Hook 自动化")
export class HookController {
  constructor(@Inject(HookService) private readonly hooks: HookService) {}

  @Get("hooks")
  @ApiDoc({ summary: "查询 Hook 定义", type: ResourceResult, array: true })
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodPipe(schema.hookQuery)) query: schema.HookQuery,
  ) {
    return this.hooks.list(user.id, query);
  }

  @Post("hooks")
  @ApiDoc({ summary: "创建声明式 Hook", type: ResourceResult, status: 201 })
  @ApiZodBody(CreateHookDto)
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodPipe(schema.createHook)) body: schema.CreateHook,
  ) {
    return this.hooks.create(user.id, body);
  }

  @Patch("hooks/:id")
  @ApiDoc({ summary: "更新 Hook", type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(UpdateHookDto)
  update(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(schema.uuidParams)) params: { id: string },
    @Body(new ZodPipe(schema.updateHook)) body: schema.UpdateHook,
  ) {
    return this.hooks.update(user.id, params.id, body);
  }

  @Delete("hooks/:id")
  @ApiDoc({ summary: "删除 Hook", type: MutationResult })
  @ApiUuidParam()
  async remove(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(schema.uuidParams)) params: { id: string },
  ) {
    await this.hooks.remove(user.id, params.id);
    return { deleted: true };
  }

  @Get("hook-handlers")
  @ApiDoc({ summary: "查询可注册的 Hook handlers", type: ResourceResult, array: true })
  handlers() {
    return this.hooks.handlerCatalog();
  }

  @Get("hook-dispatches")
  @ApiDoc({ summary: "查询 Hook 执行日志", type: ResourceResult, array: true, paged: true })
  @ApiPageQuery()
  async dispatches(
    @CurrentUser() user: AuthUser,
    @Query(new ZodPipe(schema.dispatchQuery)) query: schema.DispatchQuery,
  ) {
    const result = await this.hooks.dispatches(user.id, query);
    return ApiResult.page(result.data, {
      page: query.page,
      pageSize: query.pageSize,
      total: result.total,
    });
  }
}
