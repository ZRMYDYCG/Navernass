# Zustand Store 架构规范

## 核心原则

**每个业务域一个独立 store**，例如 `useChaptersStore`、`useNovelChatStore`、`useChatStore`。

**Slice pattern 只用于「单个 store 内部」的子域拆分**——当某个 store 自身过大、需要再拆时才用 slice 组合进同一个 `create()`。  
**禁止**把多个业务域 merge 进一个 `useAppStore`，再管每个域叫 slice——那是误用 slice 的含义。

## 目录结构

```
store/
  index.ts                 # 统一 re-export hooks + selectors + types
  create-store.ts          # createBoundStore（devtools + immer）
  store.types.ts           # StoreSet / StoreGet 等共用类型
  stores/                  # 各业务域独立 store（历史上目录名 slices，语义上每个子目录是一个 store）
    chapters/
      chapters.types.ts
      chapters.initial-state.ts
      chapters.actions.ts
      chapters.selectors.ts
      use-chapters-store.ts
      index.ts
    novel-chat/
      ...
```

## 单个 store 的文件职责

以 `chapters` 为例：

| 文件 | 职责 |
|------|------|
| `chapters.types.ts` | `ChaptersState`、`ChaptersActions`、`ChaptersStore` |
| `chapters.initial-state.ts` | 初始 state |
| `chapters.actions.ts` | action factory，`StoreSet<ChaptersStore>` |
| `chapters.selectors.ts` | selector，参数类型为 `ChaptersStore` |
| `use-chapters-store.ts` | `createBoundStore` 入口，导出 `useChaptersStore` |

## 创建 store

```typescript
import { createBoundStore } from '../../create-store'
import { createChaptersActions } from './chapters.actions'
import { chaptersInitialState } from './chapters.initial-state'
import type { ChaptersStore } from './chapters.types'

export const useChaptersStore = createBoundStore<ChaptersStore>('chapters-store', (set, get) => ({
  chapters: chaptersInitialState,
  chaptersActions: createChaptersActions(set, get),
}))
```

middleware（devtools + immer）只在 `createBoundStore` 中组合一次，禁止在 actions 或子模块里再包。

## 组件调用

只订阅需要的 store，并用 selector 缩小订阅范围：

```typescript
import { selectOrderedChapters, useChaptersStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'

const chapters = useChaptersStore(useShallow(selectOrderedChapters))
const hydrate = useChaptersStore(s => s.chaptersActions.hydrate)
```

跨 store 协作（例如 novel-chat 读 chapters 缓存）在业务层分别调用各 store，**不要**通过 mega-store 的 `get()` 跨 slice 耦合。

非 React 模块：

```typescript
useChaptersStore.getState().chaptersActions.upsertChapter(chapter)
```

## 何时在 store 内部再用 slice

仅当**同一个 store** 内有两个以上明显子域、且 state/actions 都很大时，例如未来的 `useEditorStore` 内再拆 `ui` / `selection` slice。  
当前各业务域 store 体量适中，**不需要**再嵌套 slice。

## 禁止事项

1. 禁止把所有业务域 merge 成一个 `useAppStore`。
2. 禁止把独立业务域文件夹称为 slice（除非它是某个 store 内部的子组合）。
3. 禁止在组件中无 selector 订阅整个 store。
4. 禁止在单个 store 模块内重复包裹 middleware。
5. 禁止 persist 整个 store（当前项目业务数据为会话级缓存，不使用 persist）。

## 现有 store 列表

| Hook | 职责 |
|------|------|
| `useChaptersStore` | 章节 / 卷缓存 |
| `usePlanStore` | 计划文件 |
| `useWorldviewStore` | 世界观 / 大纲 |
| `useCharacterMaterialStore` | 角色素材 |
| `useCharacterGraphStore` | 角色关系图 UI + 关系缓存 |
| `useTimelineStore` | 角色时间线事件 |
| `useAiEditsStore` | AI 修订提案 |
| `useNovelChatStore` | 编辑器内小说对话 UI 状态 |
| `useChatStore` | 主聊天页 UI 状态 |
