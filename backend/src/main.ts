import 'reflect-metadata'
import compression from 'compression'
import helmet from 'helmet'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger } from 'nestjs-pino'
import type { EnvConfig } from './config/env-schema.js'
import { AppModule } from './app.module.js'
import { requestIdMiddleware } from './common/request-id.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, bodyParser: false })
  const config = app.get(ConfigService<EnvConfig, true>)
  const logger = app.get(Logger)
  app.useLogger(logger)

  app.setGlobalPrefix(config.get('API_PREFIX', { infer: true }))
  app.use(requestIdMiddleware)
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(compression())
  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }).split(',').map(item => item.trim()),
    credentials: true,
    exposedHeaders: ['x-request-id'],
  })
  app.getHttpAdapter().getInstance().set('trust proxy', config.get('TRUST_PROXY', { infer: true }))
  app.enableShutdownHooks()

  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder()
      .setTitle('Narraverse Backend')
      .setDescription('Narraverse 非 AI 业务 API')
      .setVersion('1.0')
      .addCookieAuth('better-auth.session_token')
      .build())
    SwaggerModule.setup(`${config.get('API_PREFIX', { infer: true })}/docs`, app, document)
  }

  const port = config.get('PORT', { infer: true })
  await app.listen(port, '0.0.0.0')
  logger.log(`Narraverse backend listening on http://localhost:${port}/${config.get('API_PREFIX', { infer: true })}`)
}

void bootstrap()
