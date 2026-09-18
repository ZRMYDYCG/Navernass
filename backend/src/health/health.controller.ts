import { Controller, Get } from '@nestjs/common'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { PrismaService } from '../database/prisma.service.js'

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @AllowAnonymous()
  async health() {
    await this.prisma.$queryRaw`SELECT 1`
    return { status: 'ok', database: 'up', uptime: Math.round(process.uptime()) }
  }
}
