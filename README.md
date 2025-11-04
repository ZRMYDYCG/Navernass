# Narraverse Next.js MVP

基于 Next.js 的 AI 小说创作平台 MVP 版本，用于快速验证 MCP (Model Context Protocol) 功能。

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

访问: http://localhost:3000

## ✨ 功能特性

- 🤖 **AI 对话助手** - 智能辅助小说创作
- 📚 **小说管理** - 完整的小说 CRUD 操作
- 🗂️ **知识库** - 创作知识管理
- 🗑️ **回收站** - 已删除内容管理
- 🌓 **深色模式** - 支持亮色/暗色主题切换

## 🛠️ 技术栈

- **Next.js 15.5.5** - React 框架
- **TypeScript** - 类型安全
- **Supabase** - 后端服务（数据库 + 认证）
- **Tailwind CSS** - 样式系统
- **Radix UI** - 无障碍组件库
- **Tiptap** - 富文本编辑器
- **next-themes** - 主题切换

## 📁 项目结构

```
narraverse-next-mvp/
├── app/              # Next.js 应用页面
├── components/       # React 组件
│   ├── layout/      # 布局组件
│   └── ui/          # UI 组件库
├── lib/             # 工具函数和 API
│   ├── api/         # API 层
│   ├── supabase.ts  # Supabase 客户端
│   └── utils.ts     # 工具函数
├── providers/       # React Context 提供者
└── public/          # 静态资源
```

## 🔧 环境变量

创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 获取 Supabase 配置

1. 访问 [Supabase](https://supabase.com) 并创建一个新项目
2. 在项目设置中找到 API 配置
3. 复制 `Project URL` 和 `anon/public` key
4. 粘贴到 `.env.local` 文件中

## 📊 数据库设置

### Supabase 表结构

#### novels 表

```sql
create table novels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  cover text,
  category text,
  tags text[],
  word_count integer default 0,
  chapters integer default 0,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用行级安全策略
alter table novels enable row level security;

-- 用户只能查看自己的小说
create policy "Users can view own novels"
  on novels for select
  using (auth.uid() = user_id);

-- 用户只能插入自己的小说
create policy "Users can insert own novels"
  on novels for insert
  with check (auth.uid() = user_id);

-- 用户只能更新自己的小说
create policy "Users can update own novels"
  on novels for update
  using (auth.uid() = user_id);

-- 用户只能删除自己的小说
create policy "Users can delete own novels"
  on novels for delete
  using (auth.uid() = user_id);
```


