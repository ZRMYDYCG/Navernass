import type { AuthUser } from "../common/current-user.js";
import type { AdminResource } from "./admin.schema.js";
import { Controller, Delete, Get, Inject, Param, Query } from "@nestjs/common";
import { ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ApiResult } from "../common/api-result.js";
import { CurrentUser } from "../common/current-user.js";
import { RoleRoute } from "../common/role-route.js";
import { ZodPipe } from "../common/zod-pipe.js";
import { ApiDoc, ApiPageQuery } from "../openapi/api-doc.js";
import { MutationResult, ResourceResult } from "../openapi/api-model.js";
import { adminQuery, deleteQuery, resourceParam } from "./admin.schema.js";
import { AdminService } from "./admin.service.js";

@Controller("admin")
@RoleRoute("super_admin")
@ApiTags("后台管理")
export class AdminController {
  constructor(@Inject(AdminService) private readonly admin: AdminService) {}

  @Get("me")
  @ApiDoc({ summary: "获取管理员身份与权限", type: ResourceResult })
  me(@CurrentUser() user: AuthUser) {
    return this.admin.me(user.id);
  }

  @Get("stats")
  @ApiDoc({ summary: "获取后台统计数据", type: ResourceResult })
  stats() {
    return this.admin.stats();
  }

  @Get("resources/:resource")
  @ApiDoc({ summary: "分页查询后台资源", type: ResourceResult, array: true, paged: true })
  @ApiParam({
    name: "resource",
    enum: resourceParam.shape.resource.options,
    description: "资源类型",
  })
  @ApiPageQuery()
  @ApiQuery({ name: "status", required: false, type: String, description: "可选状态过滤" })
  async list(
    @Param(new ZodPipe(resourceParam)) params: { resource: AdminResource },
    @Query(new ZodPipe(adminQuery)) query: { page: number; pageSize: number; status?: string },
  ) {
    const result = await this.admin.list(params.resource, query.page, query.pageSize, query.status);
    return ApiResult.page(result.data as unknown[], {
      page: query.page,
      pageSize: query.pageSize,
      total: result.total,
    });
  }

  @Delete("resources/:resource")
  @ApiDoc({ summary: "删除后台资源", type: MutationResult })
  @ApiParam({
    name: "resource",
    enum: resourceParam.shape.resource.options,
    description: "资源类型",
  })
  @ApiQuery({
    name: "id",
    required: true,
    type: String,
    format: "uuid",
    description: "待删除资源 UUID",
  })
  async delete(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(resourceParam)) params: { resource: AdminResource },
    @Query(new ZodPipe(deleteQuery)) query: { id: string },
  ) {
    await this.admin.delete(params.resource, query.id, user.id);
    return { deleted: true };
  }
}
