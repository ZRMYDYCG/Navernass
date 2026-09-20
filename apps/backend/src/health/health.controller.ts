import { Controller, Get, Inject } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { PrismaService } from '../database/prisma.service.js'
import { ApiDoc } from '../openapi/api-doc.js'
import { HealthResult } from '../openapi/api-model.js'

@Controller('health')
@ApiTags('系统状态')
export class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  @AllowAnonymous()
  @ApiDoc({ summary: '检查服务与数据库健康状态', type: HealthResult, public: true })
  async health() {
    await this.prisma.$queryRaw`SELECT 1`
    return { status: 'ok', database: 'up', uptime: Math.round(process.uptime()) }
  }
}
