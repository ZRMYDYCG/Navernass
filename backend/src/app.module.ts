import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'
import { A2aModule } from './a2a/a2a.module.js'
import { AccountModule } from './account/account.module.js'
import { AdminModule } from './admin/admin.module.js'
import { AgentModule } from './agent/agent.module.js'
import { AuthCoreModule } from './auth/auth.module.js'
import { ErrorFilter } from './common/error.filter.js'
import { ResponseInterceptor } from './common/response.interceptor.js'
import { RoleGuard } from './common/role.guard.js'
import { TimeoutInterceptor } from './common/timeout.interceptor.js'
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
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers.set-cookie',
            'req.body.password',
            'req.body.apiKey',
            'body.password',
            'body.apiKey',
          ],
          censor: '[已脱敏]',
        },
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
    AgentModule,
    A2aModule,
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
