<div align="center">

<img src="./public/assets/svg/logo-dark.svg" alt="Narraverse Logo" width="120" />

# Narraverse - 小说创作平台

</div>

## 核心目标

我们专注为才华横溢的创作者打造舒适的创作环境，降低优质内容被看见、被分享、被发掘的门槛。

同时也为新手提供AI辅助，降低直面感受创作、学习创作、走进创作的门槛。

## 开发模式

环境变量配置

```bash
# SUPABASE 配置
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# 硅基流动 AI 配置
SILICON_FLOW_API_KEY=
SILICON_FLOW_BASE_URL=
SILICON_FLOW_MODEL=
```

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

## 开发规范工具链

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

## 接口文档

[文档](./app/api/api-doc.md)

## 项目 Spinner、骨架屏 统一

请不要自定义 loading, 需要保证项目 loading 风格, 特殊业务场景除外

[Spinner](./components/ui/spinner.tsx)

[骨架屏](./components/ui/secection.tsx)

## 项目提示词整理

当你实现了某一个还算复杂，需要描述很久才可以出来的交互，那你的这份提示词是不是可以考虑将其留下呢？未来也许会有相似的场景，你留下的词就派上用场了

[提示词文档](./prompts.md)