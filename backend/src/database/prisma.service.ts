import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import type { EnvConfig } from '../config/env-schema.js'
import { PrismaClient } from '../generated/prisma/client.js'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService<EnvConfig, true>) {
    const adapter = new PrismaMariaDb({
      host: config.get('DATABASE_HOST', { infer: true }),
      port: config.get('DATABASE_PORT', { infer: true }),
      user: config.get('DATABASE_USER', { infer: true }),
      password: config.get('DATABASE_PASSWORD', { infer: true }),
      database: config.get('DATABASE_NAME', { infer: true }),
      connectionLimit: config.get('DATABASE_POOL_SIZE', { infer: true }),
    })
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
