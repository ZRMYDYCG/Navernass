# @narraverse/backend

[English](./README.md) | 中文

Narraverse 业务后端与小说创作 **Agent 基础设施**。

以 **NestJS** 承载业务与鉴权，以 **Vercel AI SDK** 作为 Agent Runtime，面向 Web / 移动端 / 开发者 API / 其他 Agent 提供统一能力。

## 架构总览

![AI 小说创作 Agent 基础设施架构图](./docs/architecture.jpg)

设计目标：**开放、可扩展、可观测** — 让 AI 有记忆、懂世界、能持续创作。

| 层级 | 职责 |
| --- | --- |
| 用户层 | Web、App/小程序、开发者、其他 Agent；HTTPS / WebSocket |
| Agent-native 接口层 | REST（人机）、SSE/WebSocket（流式）、Agent Protocol / A2A（机机） |
| 模型层 | OpenAI / Anthropic / Google / DeepSeek / 通义 / 智谱 / 自定义 baseURL；多模型路由与降级 |
| Agent 运行时 | 主 Agent（规划 / 路由 / 编排）+ 角色 / 剧情 / 世界观 / 润色 / 校验等子 Agent |
| Skill 运行时 | 三级渐进加载：索引常驻 → 命中加载 `SKILL.md` → 按需加载资源 |
| 能力工具层 | 角色、设定、剧情、记忆、检索、校验等原子工具 |
| 生成与 RAG | `generateText` / `streamText` / 结构化输出；章节 / 角色 / 剧情检索与重排 |
| 记忆层 | MySQL 结构记忆 + Qdrant 语义记忆 |
| 上下文 / 可观测 | 业务与运行时上下文；链路追踪、Token、工具调用与错误日志 |

## 技术栈

- **运行时**：Node.js ≥ 24、pnpm、NestJS 12（ESM）
- **数据**：Prisma 7 + MySQL 8；Qdrant 向量库
- **鉴权**：Better Auth（Cookie / Bearer）
- **Agent**：Vercel AI SDK（`ai`）+ 多 Provider SDK
- **协议**：A2A（`@a2a-js/sdk`）Agent Card / 任务流
- **文档**：OpenAPI + Scalar（`/api/v1/docs`）
- **质量**：oxlint / oxfmt（仓库根配置）、Vitest

## 目录结构

```text
apps/backend
├── docs/architecture.jpg   # 架构图
├── docker-compose.yml      # MySQL + Qdrant（+ 可选 api）
├── prisma/                 # schema / migrations / seed
├── skills/                 # 内置 Skill（SKILL.md）
├── src/
│   ├── account/            # 账号与工作台
│   ├── admin/              # 超管
│   ├── agent/              # 模型、运行时、工具、记忆、追踪
│   ├── a2a/                # Agent2Agent 网关
│   ├── auth/               # Better Auth
│   ├── content/            # 新闻 / 调研 / 待办等
│   ├── library/            # 小说 / 卷 / 章节 / 角色
│   ├── planning/           # 世界观 / 大纲 / 时间线
│   ├── skill/              # Skill 注册、解析、装配
│   ├── common/             # 错误、守卫、拦截器
│   └── openapi/            # 文档补充
└── test/                   # Vitest
```

## 快速开始

在仓库根目录操作（pnpm workspace）。

### 1. 环境变量

```bash
cp apps/backend/.env.example apps/backend/.env
```

按需修改 `BETTER_AUTH_SECRET`、`AI_CONFIG_SECRET`（均需 ≥ 32 字符）等。

### 2. 基础设施

```bash
cd apps/backend
docker compose up -d mysql qdrant
```

默认：MySQL `localhost:3307`，Qdrant `localhost:6333`。

### 3. 数据库

```bash
pnpm --filter @narraverse/backend db:generate
pnpm --filter @narraverse/backend db:migrate
pnpm --filter @narraverse/backend db:seed   # 可选
```

### 4. 启动

```bash
# 仓库根
pnpm dev:backend
# 或
pnpm --filter @narraverse/backend dev
```

默认监听 `http://localhost:3001`，API 前缀 `api/v1`。

| 入口 | 地址 |
| --- | --- |
| API 文档 | http://localhost:3001/api/v1/docs |
| OpenAPI JSON | http://localhost:3001/api/v1/openapi.json |
| Agent Card | http://localhost:3001/.well-known/agent-card.json |
| A2A | http://localhost:3001/api/v1/a2a |
| Health | 见 `/api/v1` 下 health 模块路由 |

## 常用命令

```bash
pnpm --filter @narraverse/backend build
pnpm --filter @narraverse/backend typecheck
pnpm --filter @narraverse/backend test
pnpm --filter @narraverse/backend test:watch
pnpm --filter @narraverse/backend db:studio

# 根目录统一质量门（含 frontend + backend，排除 apps/web）
pnpm lint
pnpm format
```

## 业务模块

| 模块 | 说明 |
| --- | --- |
| 身份认证 | Better Auth 注册 / 登录 / 会话 |
| 账号与工作台 | 资料与聚合数据 |
| 作品资料库 | 小说、卷、章节、角色与关系 |
| 写作规划 | 世界观、大纲、规划文件、时间线 |
| 内容与社区 | 新闻、调研、待办、留言墙 |
| 后台管理 | 超管资源管理 |
| Agent 基础设施 | Provider 配置、主/子 Agent、工具循环、RAG、语义记忆、执行追踪 |
| Skill | 市场、安装、自定义 `SKILL.md`、小说绑定与运行时装配 |
| A2A | Agent Card、消息、流式任务与生命周期 |

统一业务响应由全局拦截器包装；AI SDK 流式与 A2A 接口遵循各自协议，不强制套同一 envelope。

## Skill 运行时

内置 Skill 位于 `skills/<name>/SKILL.md`，启动时由 `SkillRegistry` 扫描并同步到数据库。

当前内置（节选）：

- `story-planning` — 故事弧线与章节节拍
- `outline-editing` — 大纲编辑
- `worldbook-editing` — 世界观
- `brainstorm-facilitation` / `craft-discussion` — 讨论与脑暴
- `chinese-novel-style` / `polish-translate` / `editor-surgical` — 文风与润色

渐进加载约定：

1. **索引常驻** — 名称与描述，供主 Agent 发现
2. **命中加载** — 完整 `SKILL.md` 指令与工作流
3. **按需加载** — 引用、脚本等资源仅在执行需要时读取

新增 Skill：目录名必须与 frontmatter `name` 一致。

## Agent 与模型

- 运行时：`ToolLoopAgent`、`generateText` / 流式 UI message、结构化 `Output`
- 子 Agent 角色提示见 `src/agent/prompt.ts`（角色 / 剧情 / 世界观 / 润色 / 校验等）
- Provider 密钥由服务端 `AI_CONFIG_SECRET` 加密存储；支持动态 baseURL 与多模型配置
- 结构记忆走 Prisma/MySQL；语义记忆走 Qdrant（`QDRANT_*`）

## 环境变量（摘要）

完整模板见 [`.env.example`](./.env.example)。校验逻辑在 `src/config/env-schema.ts`。

| 变量 | 说明 |
| --- | --- |
| `PORT` / `API_PREFIX` | 端口与全局前缀 |
| `DATABASE_*` / `DATABASE_URL` | MySQL |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` | 鉴权 |
| `APP_URL` / `CORS_ORIGINS` | 前端源与 CORS |
| `AI_CONFIG_SECRET` | Provider 密钥加密主密钥 |
| `AGENT_MAX_STEPS` / `AGENT_TIMEOUT_MS` | Agent 步数与超时 |
| `QDRANT_URL` / `QDRANT_COLLECTION` | 向量记忆 |

## 设计原则

1. **开放** — REST + 流式 + A2A，同一套能力服务人与 Agent
2. **可扩展** — Skill / Tool / Provider / 子 Agent 可插拔
3. **可观测** — request id、结构化日志、Agent 执行追踪与 Token 计量
