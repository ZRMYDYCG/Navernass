# Next Start

位于 `apps/frontend` 的现代化 Next.js 初始化模板。

## 开始使用

```bash
pnpm install
pnpm --filter frontend dev
```

访问 `http://localhost:3000/zh-CN`，根路径会自动进入默认语言。

## 内置能力

- Next.js App Router + `[locale]` 国际化路由
- next-intl 中英文消息与类型化导航
- shadcn/ui 全量组件、Tailwind CSS 4 与语义化主题变量
- Zustand + Immer + Devtools，按 `state / actions / slice / types` 拆分
- TanStack Query / Form / Table / Virtual / Store / Pacer
- Zod 表单与接口边界校验
- Ky 请求实例、重试策略与统一错误模型

## 目录约定

```text
src/
├── app/[locale]       # 国际化页面与布局
├── components/ui      # shadcn/ui 全套组件
├── i18n               # 路由、导航、请求配置
├── lib/http           # Ky 请求层
├── lib/query          # Query Keys 与 Query Options
├── providers          # 全局 Provider
├── schemas            # Zod Schema
└── store/slices       # Zustand Immer 业务切片
```

复制 `.env.example` 为 `.env.local` 后，可修改 `NEXT_PUBLIC_API_BASE_URL` 接入真实后端。
