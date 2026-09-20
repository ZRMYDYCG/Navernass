import type { AuthUser } from '../common/current-user.js'
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { ApiResult } from '../common/api-result.js'
import { CurrentUser } from '../common/current-user.js'
import { ZodPipe } from '../common/zod-pipe.js'
import { ApiDoc, ApiPageQuery, ApiUuidParam, ApiZodBody } from '../openapi/api-doc.js'
import { MutationResult, ResourceResult } from '../openapi/api-model.js'
import { BindNovelSkillsDto, CustomSkillDto, InstallSkillDto, UpdateCustomSkillDto } from './skill.dto.js'
import * as schema from './skill.schema.js'
import { SkillService } from './skill.service.js'

@Controller()
@ApiTags('Skill 技能')
export class SkillController {
  constructor(@Inject(SkillService) private readonly skills: SkillService) {}

  @Get('skills')
  @ApiDoc({ summary: '分页查询 Skill 市场', description: '返回内置、社区及当前用户自定义 Skill，并合并安装和小说覆盖状态。', type: ResourceResult, array: true, paged: true })
  @ApiPageQuery()
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'source', required: false, enum: ['builtin', 'community', 'custom'] })
  @ApiQuery({ name: 'novelId', required: false, type: String, format: 'uuid' })
  async list(@CurrentUser() user: AuthUser, @Query(new ZodPipe(schema.skillQuery)) query: schema.SkillQuery) {
    const result = await this.skills.list(user.id, query)
    return ApiResult.page(result.data, { page: query.page, pageSize: query.pageSize, total: result.total })
  }

  @Get('skills/custom')
  @ApiDoc({ summary: '查询当前用户自定义 Skill', type: ResourceResult, array: true })
  listCustom(@CurrentUser() user: AuthUser) {
    return this.skills.listCustom(user.id)
  }

  @Post('skills/custom')
  @ApiDoc({ summary: '创建并校验自定义 SKILL.md', description: '只接受声明式 Prompt 和 Tool 名称，不执行任意代码。', type: ResourceResult, status: 201 })
  @ApiZodBody(CustomSkillDto)
  createCustom(@CurrentUser() user: AuthUser, @Body(new ZodPipe(schema.customSkill)) body: schema.CustomSkill) {
    return this.skills.createCustom(user.id, body)
  }

  @Patch('skills/custom/:id')
  @ApiDoc({ summary: '更新自定义 Skill', type: ResourceResult })
  @ApiUuidParam()
  @ApiZodBody(UpdateCustomSkillDto)
  updateCustom(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(schema.uuidParams)) params: { id: string },
    @Body(new ZodPipe(schema.updateCustomSkill)) body: schema.UpdateCustomSkill,
  ) {
    return this.skills.updateCustom(user.id, params.id, body)
  }

  @Delete('skills/custom/:id')
  @ApiDoc({ summary: '删除自定义 Skill', type: MutationResult })
  @ApiUuidParam()
  async removeCustom(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.uuidParams)) params: { id: string }) {
    await this.skills.removeCustom(user.id, params.id)
    return { deleted: true }
  }

  @Get('skills/:id')
  @ApiDoc({ summary: '获取 Skill 定义详情', type: ResourceResult })
  @ApiParam({ name: 'id', type: String, description: '内置 Skill slug 或自定义 Skill UUID' })
  detail(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.skillIdParams)) params: { id: string }) {
    return this.skills.detail(user.id, params.id)
  }

  @Patch('skills/:id/install')
  @ApiDoc({ summary: '安装、启用或停用 Skill', type: ResourceResult })
  @ApiParam({ name: 'id', type: String, description: 'Skill ID' })
  @ApiZodBody(InstallSkillDto)
  install(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(schema.skillIdParams)) params: { id: string },
    @Body(new ZodPipe(schema.installSkill)) body: schema.InstallSkill,
  ) {
    return this.skills.install(user.id, params.id, body)
  }

  @Get('novels/:id/skills')
  @ApiDoc({ summary: '查询小说绑定的 Skill', type: ResourceResult, array: true })
  @ApiUuidParam()
  listNovel(@CurrentUser() user: AuthUser, @Param(new ZodPipe(schema.uuidParams)) params: { id: string }) {
    return this.skills.listNovel(user.id, params.id)
  }

  @Put('novels/:id/skills')
  @ApiDoc({ summary: '整体更新小说 Skill 绑定', type: ResourceResult, array: true })
  @ApiUuidParam()
  @ApiZodBody(BindNovelSkillsDto)
  bindNovel(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(schema.uuidParams)) params: { id: string },
    @Body(new ZodPipe(schema.bindNovelSkills)) body: schema.BindNovelSkills,
  ) {
    return this.skills.bindNovel(user.id, params.id, body)
  }
}
