import type { EnvConfig } from "./config/env-schema.js";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import compression from "compression";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { A2aGateway } from "./a2a/a2a.gateway.js";
import { AppModule } from "./app.module.js";
import { SecretService } from "./agent/secret.service.js";
import { requestIdMiddleware } from "./common/request-id.js";
import { ensureDevFixtures } from "./common/dev-fixtures.js";
import { PrismaService } from "./database/prisma.service.js";
import { appendA2aDocs } from "./openapi/a2a-doc.js";
import { appendAuthDocs } from "./openapi/auth-doc.js";
import "reflect-metadata";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, bodyParser: false });
  const config = app.get(ConfigService<EnvConfig, true>);
  const logger = app.get(Logger);
  app.useLogger(logger);

  app.setGlobalPrefix(config.get("API_PREFIX", { infer: true }));
  app.use(requestIdMiddleware);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
          connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
        },
      },
    }),
  );
  app.enableCors({
    origin: config
      .get("CORS_ORIGINS", { infer: true })
      .split(",")
      .map((item) => item.trim()),
    credentials: true,
    exposedHeaders: ["x-request-id", "set-auth-token"],
  });
  const a2a = app.get(A2aGateway);
  const express = app.getHttpAdapter().getInstance();
  express.use("/.well-known/agent-card.json", a2a.cardMiddleware);
  express.use(`/${config.get("API_PREFIX", { infer: true })}/a2a`, a2a.restMiddleware);
  app.use(compression());
  app
    .getHttpAdapter()
    .getInstance()
    .set("trust proxy", config.get("TRUST_PROXY", { infer: true }));
  app.enableShutdownHooks();

  // 联调期临时方案：开发环境写死开发用户/小说/Provider，免登录免配置直接联调对话模块
  if (config.get("NODE_ENV", { infer: true }) === "development") {
    await ensureDevFixtures(app.get(PrismaService), config, app.get(SecretService));
  }

  if (config.get("DOCS_ENABLED", { infer: true })) {
    const apiPrefix = config.get("API_PREFIX", { infer: true });
    const configDocument = new DocumentBuilder()
      .setTitle("Narraverse API")
      .setDescription(
        "Narraverse 业务后端与小说创作 Agent 基础设施。业务接口使用统一响应结构；AI SDK 与 A2A 流式接口遵循各自官方协议。",
      )
      .setVersion("1.0.0")
      .addCookieAuth(
        "better-auth.session_token",
        {
          type: "apiKey",
          in: "cookie",
          description: "Better Auth 会话 Cookie；生产环境可能带 __Secure- 前缀。",
        },
        "better-auth",
      )
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          description: "面向 SDK 和其他 Agent 的 Better Auth 会话令牌。",
        },
        "agent-bearer",
      )
      .addTag("身份认证", "Better Auth 注册、登录、会话与退出接口")
      .addTag("账号与工作台", "个人资料及工作台聚合数据")
      .addTag("作品资料库", "小说、卷、章节、角色及关系")
      .addTag("文章编辑", "面向 Lexical 编辑器的正文 diff 提案、逐项确认、版本冲突与修订快照")
      .addTag("写作规划", "世界观、大纲、规划文件及时间线")
      .addTag("内容与社区", "新闻、调研、待办与留言墙")
      .addTag("后台管理", "仅超级管理员可访问的资源管理接口")
      .addTag("Agent 基础设施", "模型配置、主/子 Agent、工具循环、RAG、语义记忆和执行追踪")
      .addTag("Skill 技能", "Skill 市场、安装、自定义 SKILL.md、小说绑定与运行时装配")
      .addTag("A2A Agent2Agent", "官方 A2A v1 Agent Card、消息、流式任务与生命周期接口")
      .addTag("系统状态", "服务健康检查")
      .build();
    const rawDocument = SwaggerModule.createDocument(app, configDocument, {
      operationIdFactory: (controller, method) =>
        `${controller.replace(/Controller$/, "")}_${method}`,
    });
    const document = appendA2aDocs(appendAuthDocs(cleanupOpenApiDoc(rawDocument)));
    const jsonPath = `/${apiPrefix}/openapi.json`;
    const docsPath = `/${apiPrefix}/docs`;

    // OpenAPI JSON 便于代码生成、自动化测试以及导入第三方 API 工具。
    app
      .getHttpAdapter()
      .getInstance()
      .get(jsonPath, (_request: unknown, response: { json: (body: unknown) => void }) => {
        response.json(document);
      });
    app.use(
      docsPath,
      apiReference({
        content: document,
        pageTitle: "Narraverse API 文档",
        theme: "purple",
        layout: "modern",
        showSidebar: true,
        hideModels: false,
        persistAuth: true,
        defaultHttpClient: { targetKey: "js", clientKey: "fetch" },
      }),
    );
  }

  const port = config.get("PORT", { infer: true });
  await app.listen(port, "0.0.0.0");
  logger.log(
    `Narraverse backend listening on http://localhost:${port}/${config.get("API_PREFIX", { infer: true })}`,
  );
}

void bootstrap();
