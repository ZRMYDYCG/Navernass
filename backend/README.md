# Narraverse Backend

独立的 NestJS 12 后端，负责 Narraverse 的非 AI 业务。认证使用 Better Auth，数据层使用 Prisma 7 + MySQL 8.4，输入校验使用 Zod 4。

## 领域边界

已迁移：用户资料、小说、卷、章节、角色与关系、世界观、大纲、规划文件、角色时间线、产品动态、调研、写作待办、留言墙与后台管理。

明确排除：普通/小说 AI 对话与消息、模型/API Key 配置、Agent、AI SDK、生成接口及 Skill 系统。

## 本地启动

```bash
cp backend/.env.example backend/.env
docker compose -f backend/docker-compose.yml up -d mysql
pnpm install
pnpm --dir backend db:generate
pnpm --dir backend db:migrate --name init
pnpm --dir backend dev
```

Compose 默认把 MySQL 暴露到宿主机 `3307`，避免与开发机已有的 MySQL `3306` 冲突；容器内部仍使用 `3306`。

- 健康检查：`GET http://localhost:3001/api/v1/health`
- Scalar 交互文档：`http://localhost:3001/api/v1/docs`
- OpenAPI JSON：`http://localhost:3001/api/v1/openapi.json`

接口文档默认开启，可通过 `DOCS_ENABLED=false` 关闭。生产部署建议仅在受信网络中开启。
文档中的请求体直接复用 Zod 校验模型，登录接口成功后 Scalar 会保留 Better Auth Cookie，
可以继续调试需要登录态的业务接口。

## 小说创作 Agent 基础设施

`agent` 模块不是单一的文本生成接口，而是一套可扩展的创作运行时：

- 模型层：OpenAI、Anthropic、Google，以及 DeepSeek、通义千问、智谱和任意 OpenAI-compatible 服务；每个用户可以动态配置 `baseUrl`、`apiKey`、模型和嵌入模型。
- Agent 层：主 Agent 负责任务拆分与结果统筹，角色、剧情、世界观、文风、审核五类 Subagent 负责专业任务。
- Tool 层：小说快照、章节正文、混合记忆检索、长期记忆写入、一致性审核和 Subagent 委派全部工具化。
- 生成层：同步文本、Vercel AI SDK UI Message Stream v1、Zod 强校验结构化输出。
- 记忆层：MySQL 保存可审计原文和元数据，Qdrant 保存语义向量；集合按向量维度隔离。
- RAG 层：向量相似度与 MySQL 关键词命中混合召回，按用户和小说强制隔离。
- 可观测层：每次执行保存 run、step、tool call、token usage、耗时、结束原因和错误。

核心接口：

- `GET /api/v1/agent/manifest`：Agent-native 能力清单
- `POST /api/v1/agent/providers`：创建加密 Provider 配置
- `POST /api/v1/agent/runs`：多步 Agent 执行
- `POST /api/v1/agent/runs/stream`：原生 AI SDK UI Message Stream v1，可直接消费文本与 Tool Parts
- `POST /api/v1/agent/runs/structured`：结构化生成
- `POST /api/v1/agent/memories/sync`：结构化小说数据向量化
- `POST /api/v1/agent/memories/search`：混合 RAG 检索
- `GET /api/v1/agent/runs/:id`：完整 Trace、步骤和工具调用

浏览器可以使用 HttpOnly Cookie；SDK 和其他 Agent 可以读取登录响应的 `set-auth-token`
响应头，并通过 `Authorization: Bearer <token>` 调用同一组受保护接口。

Provider API Key 使用 `AI_CONFIG_SECRET` 派生的 AES-256-GCM 密钥加密，接口和日志均不会返回明文。
生产环境必须替换 Compose 中的本地开发密钥，并限制 Qdrant 端口的公网访问。
- Better Auth：`/api/auth/*`（认证路由保持行业默认路径，业务 API 使用 `/api/v1/*`）

## Supabase 数据迁移

先对 MySQL 执行 Prisma migration，再在 `backend/.env` 填写只读的 `SUPABASE_DATABASE_URL`：

```bash
pnpm --dir backend db:import
```

导入脚本是幂等的，保留原 UUID，并按外键顺序迁移所有非 AI/Skill 表。Supabase Auth 与 Better Auth 的密码哈希格式不承诺兼容，因此用户与资料会迁移，但存量用户需要走一次密码重置流程；旧 `profiles.password_hash` 只保存在 `legacy_password_hash` 供审计，业务不会读取。

## 架构约束

- Better Auth 的认证守卫默认保护所有路由，仅健康检查、已发布内容、动态和留言墙显式开放。
- 所有用户数据查询同时约束资源 ID 和当前用户 ID，替代 Supabase RLS。
- 业务错误使用稳定错误码；未知异常、HTTP 异常和 Prisma 异常由全局过滤器统一映射。
- 全局具备请求 ID、结构化日志、敏感字段脱敏、限流、超时、统一响应与 Zod 管道。
- 章节创建、更新、删除通过事务同步维护小说章节数与总字数。
- 删除章节、卷与规划资料默认软删除；删除小说依靠数据库级级联清理。
