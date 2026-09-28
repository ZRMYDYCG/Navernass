import type { z } from "zod";
import type { AuthUser } from "../common/current-user.js";
import { Body, Controller, Get, HttpCode, Inject, Param, Post, Query } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { ApiResult } from "../common/api-result.js";
import { CurrentUser } from "../common/current-user.js";
import { ZodPipe } from "../common/zod-pipe.js";
import { ApiDoc, ApiUuidParam, ApiZodBody } from "../openapi/api-doc.js";
import { ResourceResult } from "../openapi/api-model.js";
import { ApplyEditDto, RejectEditDto } from "./editor.dto.js";
import * as schema from "./editor.schema.js";
import { EditorService } from "./editor.service.js";

@Controller("editor/edits")
@ApiTags("文章编辑")
export class EditorController {
  constructor(@Inject(EditorService) private readonly editor: EditorService) {}

  @Get()
  @ApiDoc({ summary: "分页查询文章 diff 提案", type: ResourceResult, array: true, paged: true })
  @ApiQuery({ name: "chapterId", required: false, format: "uuid" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["pending", "applied", "rejected", "stale"],
  })
  async list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodPipe(schema.editQuery)) query: schema.EditQuery,
  ) {
    const result = await this.editor.list(user.id, query);
    return ApiResult.page(result.data, { ...query, total: result.total });
  }

  @Get(":id")
  @ApiDoc({
    summary: "获取 diff 提案详情",
    description: "返回原文、建议正文和结构化操作，前端可直接交给 diff 库及 Lexical 适配层。",
    type: ResourceResult,
  })
  @ApiUuidParam()
  get(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(schema.editParams)) params: { id: string },
  ) {
    return this.editor.get(user.id, params.id);
  }

  @Post(":id/apply")
  @HttpCode(200)
  @ApiDoc({
    summary: "应用全部或部分 diff",
    description: "通过章节 revision 与 SHA-256 哈希进行乐观锁校验，冲突时返回 409。",
    type: ResourceResult,
  })
  @ApiUuidParam()
  @ApiZodBody(ApplyEditDto)
  apply(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(schema.editParams)) params: { id: string },
    @Body(new ZodPipe(schema.applyEdit)) body: schema.ApplyEdit,
  ) {
    return this.editor.apply(user.id, params.id, body);
  }

  @Post(":id/reject")
  @HttpCode(200)
  @ApiDoc({ summary: "拒绝 diff 提案", type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(RejectEditDto)
  reject(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(schema.editParams)) params: { id: string },
    @Body(new ZodPipe(schema.rejectEdit)) body: z.infer<typeof schema.rejectEdit>,
  ) {
    return this.editor.reject(user.id, params.id, body.reason);
  }
}
