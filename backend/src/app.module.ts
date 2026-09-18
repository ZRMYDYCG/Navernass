import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'
import { AccountModule } from './account/account.module.js'
import { AdminModule } from './admin/admin.module.js'
import { AuthCoreModule } from './auth/auth.module.js'
import { RoleGuard } from './common/role.guard.js'
import { ResponseInterceptor } from './common/response.interceptor.js'
import { TimeoutInterceptor } from './common/timeout.interceptor.js'
import { ErrorFilter } from './common/error.filter.js'
import { validateEnv } from './config/env-schema.js'
import { ContentModule } from './content/content.module.js'
import { DatabaseModule } from './database/database.module.js'
import { HealthModule } from './health/health.module.js'
import { LibraryModule } from './library/library.module.js'
import { PlanningModule } from './planning/planning.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie', 'body.password'],
        transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } } : undefined,
      },
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    DatabaseModule,
    AuthCoreModule,
    HealthModule,
    AccountModule,
    LibraryModule,
    PlanningModule,
    ContentModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
    { provide: APP_FILTER, useClass: ErrorFilter },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
