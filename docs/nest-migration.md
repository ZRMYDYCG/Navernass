# Nest 后端渐进式迁移

当前采用绞杀者模式迁移：Next.js 保持 UI 和同源 BFF，NestJS 接管鉴权后的业务与 AI 流。

## 当前边界

- Next.js：页面、React 状态、AI SDK UI transport、`/api/backend/*` 同源代理
- NestJS：配置、Supabase 请求级鉴权、模型 provider、Agent/业务模块、流式响应
- Supabase：继续通过用户 cookie 和 RLS 约束数据访问

第一条已迁移链路是编辑器选区 AI：

`Browser -> /api/backend/v1/editor/selection-ai/stream -> Nest -> AI SDK Core -> LLM`

原 Next Route Handler 暂时保留。通过 `NEXT_PUBLIC_NEST_BACKEND_ENABLED=true` 开启 Nest 链路，便于灰度和回滚。

## 本地运行

1. 在根目录环境文件配置 Supabase 与 `LLM_*` 变量。
2. 安装 workspace 依赖：`pnpm install`。
3. 同时启动 Web 与 Nest：`pnpm dev:all`。
4. 访问 `GET http://localhost:3001/api/v1/health` 验证后端。
5. 将 `NEXT_PUBLIC_NEST_BACKEND_ENABLED` 设为 `true`，验证选区 AI 流。

## 后续迁移顺序

1. 抽取共享 DTO 与错误契约。
2. 迁移主聊天 `chat/stream`，拆为 Conversation、Agent Runtime、Tools 三个模块。
3. 迁移编辑器 Novel Chat 与 Character Script 流。
4. 迁移 conversations/messages/novels 等 CRUD。
5. 删除对应的 Next Route Handler 和灰度开关。
