<div align="center">

<img src="./public/assets/svg/logo-dark.svg" alt="Narraverse Logo" width="120" />

# Narraverse - 小说创作平台

业务架构迁移中.......

```bash
前端（Next/React）
  └─ Vercel AI SDK hooks（useChat）
        └─ Chat UI / 流式渲染 / 消息状态管理 / 自定义 message parts

BFF
  └─ Next API Route /api/chat
        └─ 鉴权、会话拼装、协议转换、持久化、埋点

后端核心服务
  └─ NestJS
        └─ LangChain / 自研 Agent Orchestrator
              └─ tools / workflow / memory / knowledge / model routing
```

</div>

## ✨ 特性亮点

- **AI 辅助创作**：集成 Silicon Flow AI，为创作者提供智能续写、润色、摘要等功能
- **多项目管理**：支持小说、章节、角色、关系图谱的完整管理
- **沉浸式编辑器**：基于 Tiptap 的富文本编辑器，支持 Markdown 语法
- **多主题支持**：支持 Default、Blue、Green、Orange、Red 等多种主题
- **响应式设计**：适配桌面端和移动端设备

## 核心目标

我们专注为才华横溢的创作者打造舒适的创作环境，降低优质内容被看见、被分享、被发掘的门槛。

同时也为新手提供AI辅助，降低直面感受创作、学习创作、走进创作的门槛。

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+ (推荐) 或 npm 8+
- Supabase 账户 (用于数据库)
- Silicon Flow 账户 (用于 AI 功能)

### 安装依赖

```bash
pnpm install
```

### 环境变量配置

创建 `.env.local` 文件：

```bash
# SUPABASE 配置
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# 硅基流动 AI 配置
SILICON_FLOW_API_KEY=
SILICON_FLOW_BASE_URL=
SILICON_FLOW_MODEL=

```

**API Key 配置说明：**

- 用户可在应用设置界面中配置 API Key
- API Key 将保存到 Supabase 云端数据库的 `user_settings` 表
- 数据库表结构已包含在 `migrations/init_database.sql` 中
- API 路由会自动从云端获取用户的 API Key

代码格式化配置

新建 .vscode/settings.json

```json
{
  // Disable the default formatter, use eslint instead
  "prettier.enable": false,
  "editor.formatOnSave": false,

  // Auto fix
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

  // Silent the stylistic rules in you IDE, but still auto fix them
  "eslint.rules.customizations": [
    { "rule": "style/*", "severity": "off", "fixable": true },
    { "rule": "format/*", "severity": "off", "fixable": true },
    { "rule": "*-indent", "severity": "off", "fixable": true },
    { "rule": "*-spacing", "severity": "off", "fixable": true },
    { "rule": "*-spaces", "severity": "off", "fixable": true },
    { "rule": "*-order", "severity": "off", "fixable": true },
    { "rule": "*-dangle", "severity": "off", "fixable": true },
    { "rule": "*-newline", "severity": "off", "fixable": true },
    { "rule": "*quotes", "severity": "off", "fixable": true },
    { "rule": "*semi", "severity": "off", "fixable": true }
  ],

  // Enable eslint for all supported languages
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml",
    "toml",
    "xml",
    "gql",
    "graphql",
    "astro",
    "svelte",
    "css",
    "less",
    "scss",
    "pcss",
    "postcss"
  ]
}
```

## 📦 技术栈

| 类别      | 技术                    |
| --------- | ----------------------- |
| 框架      | Next.js 16 (App Router) |
| 语言      | TypeScript              |
| 数据库    | Supabase                |
| AI 服务   | Silicon Flow API        |
| 样式      | Tailwind CSS v4         |
| 编辑器    | Tiptap                  |
| UI 组件   | Radix UI + 自定义组件   |
| 状态管理  | React Context / Hooks   |
| Git Hooks | Lefthook                |
| 代码规范  | ESLint + Commitlint     |

## 📁 项目结构

```bash
├── app/                          # Next.js App Router
│   ├── (main)/                   # 主要应用页面
│   │   ├── chat/                # AI 对话功能
│   │   ├── novels/              # 小说管理
│   │   ├── trash/               # 回收站
│   │   └── workspace/            # 工作台
│   ├── (marketing)/              # 营销页面
│   ├── (writing)/               # 写作编辑器
│   │   └── editor/              # 沉浸式编辑器
│   ├── api/                     # API 路由
│   └── publish/                  # 发布页面
├── components/                   # 可复用组件
│   ├── tiptap/                  # Tiptap 编辑器相关
│   └── ui/                      # UI 基础组件
├── lib/                         # 工具函数和 SDK
│   └── supabase/                # Supabase 客户端
├── hooks/                       # 自定义 Hooks
├── providers/                   # React Providers
├── store/                       # 状态管理
└── prompts/                     # AI 提示词模板
```

## ⚙️ 开发模式

### 开发规范工具链

Git Hooks 管理

lefthook

代码质量检查

eslint @antfu/eslint-config eslint-plugin-tailwindcss

Commit 规范

@commitlint/cli @commitlint/config-conventional

commitizen cz-git

暂存区代码检查

lint-staged

版本发布自动化

release-it @release-it/conventional-changelog

### 服务端设计

> RESTful API 架构

基于 Next.js App Router 的 Route Handlers 实现:

```bash
lib/supabase/sdk
├── utils/
│   ├── response.ts          # 统一响应格式
│   ├── handler.ts           # 错误处理中间件
├── services/                # 业务逻辑层
│   ├── novels.service.ts
│   ├── chapters.service.ts
│   ├── conversations.service.ts
│   └── messages.service.ts
├── client.ts                # 客户端 API 调用工具
├── types.ts                 # 类型定义
├── novels.ts                # Novels 客户端 API
├── chapters.ts              # Chapters 客户端 API
├── conversations.ts         # Conversations 客户端 API
├── messages.ts              # Messages 客户端 API
└── index.ts                 # 统一导出

app/api/                     # API 路由
├── novels/
│   ├── route.ts             # GET /api/novels, POST /api/novels
│   ├── [id]/
│   │   ├── route.ts         # GET/PUT/DELETE /api/novels/:id
│   │   ├── archive/route.ts
│   │   ├── restore/route.ts
│   │   ├── publish/route.ts
│   │   └── chapters/route.ts
│   └── archived/route.ts
├── chapters/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── reorder/route.ts
├── conversations/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── recent/route.ts
└── messages/
    ├── batch/route.ts
    └── [id]/route.ts
```

## 创建一个 api 服务

1. **创建 Service**

```typescript
// lib/api/services/new-feature.service.ts
export class NewFeatureService {
  async getList() {}
  async create(data) {}
}
```

2. **创建 Route Handler**

```typescript
// app/api/new-feature/route.ts
export const GET = withErrorHandler(async (req) => {
  const service = new NewFeatureService()
  const data = await service.getList()
  return ApiResponseBuilder.success(data)
})
```

3. **创建客户端 API**

```typescript
// lib/api/new-feature.ts
export const newFeatureApi = {
  getList: () => apiClient.get('/api/new-feature'),
}
```

## 响应格式规范

### 成功响应

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 100
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "NOVEL_NOT_FOUND",
    "message": "Novel not found",
    "details": {}
  }
}
```

## 📜 可用脚本

| 命令             | 描述                                |
| ---------------- | ----------------------------------- |
| `pnpm dev`       | 启动开发服务器 (Turbopack)          |
| `pnpm build`     | 构建生产版本                        |
| `pnpm start`     | 启动生产服务器                      |
| `pnpm lint`      | 运行 ESLint 检查                    |
| `pnpm lint:fix`  | 自动修复 ESLint 问题                |
| `pnpm typecheck` | 运行 TypeScript 类型检查            |
| `pnpm commit`    | 打开交互式 Commit 对话框            |
| `pnpm release`   | 发布新版本 (支持 minor/major/patch) |
| `pnpm db:push`   | 推送数据库变更到 Supabase           |
| `pnpm db:pull`   | 从 Supabase 拉取数据库变更          |

## 🤝贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代品
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Tiptap](https://tiptap.dev/) - 富文本编辑器
- [Silicon Flow](https://siliconflow.cn/) - AI 服务提供商
