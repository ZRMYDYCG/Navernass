# 🚀 快速启动指南

## 1. 安装依赖

```bash
cd narraverse-next-mvp
pnpm install
```

## 2. 配置环境变量 (可选)

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

> 如果不配置，默认使用 `http://localhost:8000/api`

## 3. 启动开发服务器

```bash
pnpm dev
```

服务器将在 http://localhost:3000 启动

## 4. 访问页面

打开浏览器访问以下页面：

- 🏠 **首页 (AI 对话)**: http://localhost:3000
- 📊 **仪表盘**: http://localhost:3000/dashboard
- 📚 **小说列表**: http://localhost:3000/novels
- 🗂️ **知识库**: http://localhost:3000/knowledge
- 📁 **素材库**: http://localhost:3000/materials
- 🔄 **编排**: http://localhost:3000/composition
- 🗑️ **回收站**: http://localhost:3000/trash

## 5. 主要功能

### 主题切换

点击右上角的调色板图标，可以切换：

- ☀️ 亮色模式
- 🌙 暗色模式
- 💻 系统跟随

### 导航

使用左侧边栏快速导航到不同页面

### AI 对话

在首页可以：

- 创建新对话
- 查看对话历史
- 与 AI 助手交互（需要后端支持）

## 6. 开发提示

### 添加新页面

在 `app/` 目录下创建新文件夹：

```tsx
// app/new-page/page.tsx
"use client";

import { MainLayout } from "@/components/layout/MainLayout";

export default function NewPage() {
  return (
    <MainLayout>
      <div>Your content here</div>
    </MainLayout>
  );
}
```

### 使用 API

```tsx
import { useQuery } from "@tanstack/react-query";
import { novelsApi } from "@/lib/api/novels";

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["novels"],
    queryFn: () => novelsApi.getList(),
  });

  // ...
}
```

### Toast 通知

```tsx
import { toast } from "sonner";

toast.success("操作成功！");
toast.error("操作失败！");
toast.info("提示信息");
```

## 7. 构建生产版本

```bash
# 构建
pnpm build

# 启动生产服务器
pnpm start
```

## 8. 故障排除

### 端口被占用

修改端口：

```bash
pnpm dev -p 3001
```

### 样式不生效

清除 Next.js 缓存：

```bash
rm -rf .next
pnpm dev
```

### 依赖问题

重新安装：

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 9. 更多帮助

- 查看 [README.md](./README.md) 了解项目概览
- 查看 [MIGRATION.md](./MIGRATION.md) 了解迁移详情
- 访问 [Next.js 文档](https://nextjs.org/docs)

---

**祝开发愉快！** 🎉
