import { Controller, Delete, Get, Param, Query } from '@nestjs/common'
import { ApiResult } from '../common/api-result.js'
import { CurrentUser, type AuthUser } from '../common/current-user.js'
import { RoleRoute } from '../common/role-route.js'
import { ZodPipe } from '../common/zod-pipe.js'
import { AdminService } from './admin.service.js'
import { adminQuery, deleteQuery, resourceParam, type AdminResource } from './admin.schema.js'

@Controller('admin')
@RoleRoute('super_admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.admin.me(user.id)
  }

  @Get('stats')
  stats() {
    return this.admin.stats()
  }

  @Get('resources/:resource')
  async list(
    @Param(new ZodPipe(resourceParam)) params: { resource: AdminResource },
    @Query(new ZodPipe(adminQuery)) query: { page: number, pageSize: number, status?: string },
  ) {
    const result = await this.admin.list(params.resource, query.page, query.pageSize, query.status)
    return ApiResult.page(result.data as unknown[], { page: query.page, pageSize: query.pageSize, total: result.total })
  }

  @Delete('resources/:resource')
  async delete(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(resourceParam)) params: { resource: AdminResource },
    @Query(new ZodPipe(deleteQuery)) query: { id: string },
  ) {
    await this.admin.delete(params.resource, query.id, user.id)
    return { deleted: true }
  }
}
