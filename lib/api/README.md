# API 使用文档

本目录包含所有与 Supabase 交互的 API 接口。

## 📁 文件结构

```
lib/api/
├── index.ts           # 统一导出入口
├── types.ts           # TypeScript 类型定义
├── profiles.ts        # 用户信息 API
├── novels.ts          # 小说 API
├── chapters.ts        # 章节 API
├── knowledge.ts       # 知识库 API
├── conversations.ts   # 对话 API
└── messages.ts        # 消息 API
```

## 🚀 使用方法

### 1. 导入 API

```typescript
// 方式 1: 导入特定 API
import { novelsApi, chaptersApi } from "@/lib/api";

// 方式 2: 导入所有
import * as api from "@/lib/api";
```

### 2. 使用示例

#### 用户信息

```typescript
import { profilesApi } from "@/lib/api";

// 获取当前用户 profile
const profile = await profilesApi.getCurrent();

// 更新 profile
const updated = await profilesApi.update({
  username: "新用户名",
  bio: "个人简介",
});

// 上传头像
const avatarUrl = await profilesApi.uploadAvatar(file);
```

#### 小说管理

```typescript
import { novelsApi } from "@/lib/api";

// 获取小说列表（带分页）
const result = await novelsApi.getList({
  page: 1,
  pageSize: 10,
  status: "published",
});
console.log(result.data, result.total);

// 创建小说
const novel = await novelsApi.create({
  title: "我的小说",
  description: "小说简介",
  category: "科幻",
  tags: ["太空", "冒险"],
});

// 更新小说
await novelsApi.update({
  id: novel.id,
  title: "新标题",
});

// 发布小说
await novelsApi.publish(novel.id);

// 归档小说
await novelsApi.archive(novel.id);

// 删除小说
await novelsApi.delete(novel.id);
```

#### 章节管理

```typescript
import { chaptersApi } from "@/lib/api";

// 获取小说的所有章节
const chapters = await chaptersApi.getByNovelId(novelId);

// 创建章节
const chapter = await chaptersApi.create({
  novel_id: novelId,
  title: "第一章",
  content: "<p>章节内容...</p>",
  order_index: 1,
});

// 更新章节
await chaptersApi.update({
  id: chapter.id,
  content: "<p>更新后的内容...</p>",
});

// 批量更新章节顺序
await chaptersApi.updateOrder([
  { id: "chapter-1", order_index: 0 },
  { id: "chapter-2", order_index: 1 },
]);

// 删除章节
await chaptersApi.delete(chapter.id);
```

#### 知识库管理

```typescript
import { knowledgeBasesApi, knowledgeItemsApi } from "@/lib/api";

// 创建知识库
const kb = await knowledgeBasesApi.create({
  name: "世界观设定",
  description: "我的小说世界观",
  icon: "🌍",
  color: "#3B82F6",
});

// 获取所有知识库
const kbs = await knowledgeBasesApi.getList();

// 创建文件夹
const folder = await knowledgeItemsApi.create({
  knowledge_base_id: kb.id,
  type: "folder",
  name: "角色设定",
  order_index: 0,
});

// 创建文件
const file = await knowledgeItemsApi.create({
  knowledge_base_id: kb.id,
  parent_id: folder.id,
  type: "file",
  name: "主角设定",
  content: "# 主角\n\n姓名：张三",
  order_index: 0,
});

// 获取树形结构
const tree = await knowledgeItemsApi.getTreeByKnowledgeBaseId(kb.id);

// 移动条目
await knowledgeItemsApi.move(file.id, newParentId);
```

#### 对话管理

```typescript
import { conversationsApi, messagesApi } from "@/lib/api";

// 创建对话
const conversation = await conversationsApi.create({
  title: "新对话",
  novel_id: novelId, // 可选：关联小说
});

// 获取对话列表
const conversations = await conversationsApi.getList();

// 获取最近对话
const recent = await conversationsApi.getRecent(5);

// 发送消息（用户）
const userMsg = await messagesApi.create({
  conversation_id: conversation.id,
  role: "user",
  content: "你好，AI",
});

// 发送消息（AI）
const aiMsg = await messagesApi.create({
  conversation_id: conversation.id,
  role: "assistant",
  content: "你好！有什么可以帮助你的吗？",
  model: "gpt-4",
  tokens: 15,
});

// 获取对话的所有消息
const messages = await messagesApi.getByConversationId(conversation.id);

// 清空对话
await messagesApi.clearByConversationId(conversation.id);
```

## 🎯 在 React 组件中使用

### 基础用法

```typescript
"use client";

import { useState, useEffect } from "react";
import { novelsApi, type Novel } from "@/lib/api";
import { toast } from "sonner";

export function NovelsList() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      const result = await novelsApi.getList({ page: 1, pageSize: 10 });
      setNovels(result.data);
    } catch (error) {
      toast.error("加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const novel = await novelsApi.create({
        title: "新小说",
      });
      setNovels([novel, ...novels]);
      toast.success("创建成功！");
    } catch (error) {
      toast.error("创建失败");
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <button onClick={handleCreate}>创建新小说</button>
      {novels.map((novel) => (
        <div key={novel.id}>{novel.title}</div>
      ))}
    </div>
  );
}
```

### 使用自定义 Hook

```typescript
// hooks/useNovels.ts
import { useState, useEffect } from "react";
import { novelsApi, type Novel } from "@/lib/api";

export function useNovels() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNovels = async () => {
    try {
      setLoading(true);
      const result = await novelsApi.getList();
      setNovels(result.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNovels();
  }, []);

  return { novels, loading, error, reload: loadNovels };
}

// 在组件中使用
function MyComponent() {
  const { novels, loading, error, reload } = useNovels();

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return <div>{/* 渲染小说列表 */}</div>;
}
```

## 🔒 错误处理

所有 API 方法都会抛出错误，请务必使用 try-catch：

```typescript
try {
  const result = await novelsApi.create({ title: "新小说" });
  toast.success("创建成功！");
} catch (error) {
  console.error(error);
  toast.error(error.message || "操作失败");
}
```

## 📝 TypeScript 类型

所有类型定义都在 `types.ts` 中，可以直接导入使用：

```typescript
import type { Novel, Chapter, KnowledgeBase, Conversation, Message } from "@/lib/api";
```

## 🎨 最佳实践

1. **统一错误处理**：在顶层组件或自定义 Hook 中统一处理错误
2. **加载状态**：总是显示加载指示器
3. **乐观更新**：先更新 UI，再发送请求
4. **数据缓存**：避免重复请求相同数据
5. **类型安全**：充分利用 TypeScript 类型检查

## 📚 相关文档

- [Supabase 文档](https://supabase.com/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
