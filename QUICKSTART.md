# 🚀 快速启动指南

## 1. 安装依赖

```bash
cd narraverse-next-mvp
pnpm install
```

## 2. 配置环境变量 (必需)

创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 获取 Supabase 配置

1. 访问 [Supabase](https://supabase.com) 并创建一个新项目
2. 在项目设置 > API 中找到：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 复制到 `.env.local` 文件中

### 设置数据库表

在 Supabase SQL Editor 中执行以下 SQL（参见 README.md 中的完整表结构）：

```sql
-- 创建 novels 表
create table novels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text default 'draft',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 启用行级安全
alter table novels enable row level security;
```

## 3. 启动开发服务器

```bash
pnpm dev
```

服务器将在 http://localhost:3000 启动

## 4. 访问页面

打开浏览器访问以下页面：

- 🏠 **首页 (AI 对话)**: http://localhost:3000
- 📚 **小说列表**: http://localhost:3000/novels
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

### 使用 Supabase API

```tsx
"use client";

import { useEffect, useState } from "react";
import { novelsApi } from "@/lib/api/novels";

function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    novelsApi.getList().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

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

- 查看 [README.md](./README.md) 了解项目概览和完整的数据库设置
- 访问 [Next.js 文档](https://nextjs.org/docs)
- 访问 [Supabase 文档](https://supabase.com/docs)

---

**祝开发愉快！** 🎉
