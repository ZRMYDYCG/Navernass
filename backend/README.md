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
