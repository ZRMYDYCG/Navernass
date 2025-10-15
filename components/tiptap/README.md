# Tiptap 编辑器组件

这是一个基于 [Tiptap](https://tiptap.dev/) 的富文本编辑器组件，专为写作场景设计。

## 组件列表

### TiptapEditor

主编辑器组件，提供完整的富文本编辑功能。

**特性：**

- ✅ 富文本编辑（加粗、斜体、下划线）
- ✅ 标题支持（H1, H2, H3）
- ✅ 浮动工具栏
- ✅ 字数统计
- ✅ 自动保存
- ✅ 占位符提示
- ✅ 黑白主题支持

**Props：**

```typescript
interface TiptapEditorProps {
  content?: string; // 初始内容（HTML 格式）
  placeholder?: string; // 占位符文本
  onUpdate?: (content: string) => void; // 内容更新回调
  onStatsChange?: (stats: TiptapEditorStats) => void; // 字数统计回调
  autoSave?: boolean; // 是否启用自动保存（默认：true）
  autoSaveDelay?: number; // 自动保存延迟（毫秒，默认：3000）
  className?: string; // 自定义样式类名
}

interface TiptapEditorStats {
  words: number; // 字数
  characters: number; // 字符数
}
```

**使用示例：**

```tsx
import { TiptapEditor } from "~/components/tiptap";
import { useState } from "react";

function MyEditor() {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const handleUpdate = async (content: string) => {
    // 保存内容到服务器
    await saveToServer(content);
  };

  const handleStatsChange = (stats: { words: number; characters: number }) => {
    setWordCount(stats.words);
    setCharCount(stats.characters);
  };

  return (
    <div>
      <TiptapEditor
        content="<p>初始内容...</p>"
        placeholder="开始写作..."
        onUpdate={handleUpdate}
        onStatsChange={handleStatsChange}
        autoSave={true}
        autoSaveDelay={3000}
        className="max-w-4xl mx-auto"
      />
      <div>
        字数：{wordCount} | 字符：{charCount}
      </div>
    </div>
  );
}
```

### FloatingMenu

浮动工具栏组件，当用户选中文本时自动显示。

**特性：**

- 自动跟随文本选区
- 包含常用格式化工具
- 支持黑白主题

**Props：**

```typescript
interface FloatingMenuProps {
  editor: Editor | null; // Tiptap 编辑器实例
}
```

**注意：** FloatingMenu 已经内置在 TiptapEditor 组件中，通常不需要单独使用。

### useTiptapEditor

用于创建自定义编辑器实例的 Hook。

**使用示例：**

```tsx
import { useTiptapEditor } from "~/components/tiptap";

function MyCustomEditor() {
  const editor = useTiptapEditor("<p>初始内容</p>");

  if (!editor) return null;

  return (
    <div>
      <button onClick={() => editor.chain().focus().toggleBold().run()}>加粗</button>
      <EditorContent editor={editor} />
    </div>
  );
}
```

## 样式定制

编辑器使用 Tailwind CSS 和自定义 prose 样式。相关样式在 `app/app.css` 中定义：

```css
/* Tiptap Editor Styles */
.ProseMirror { ... }
.prose { ... }
.dark .prose { ... }
```

## 快捷键

- `Ctrl/Cmd + B` - 加粗
- `Ctrl/Cmd + I` - 斜体
- `Ctrl/Cmd + U` - 下划线
- `Ctrl/Cmd + Alt + 1/2/3` - 标题 1/2/3

## 扩展支持

当前包含的扩展：

- StarterKit（段落、粗体、斜体等基础功能）
- Placeholder（占位符）
- CharacterCount（字数统计）
- Underline（下划线）
- TextAlign（文本对齐）

如需添加更多扩展，请修改 `TiptapEditor.tsx` 中的 `extensions` 配置。

## 依赖包

```json
{
  "@tiptap/react": "^3.6.5",
  "@tiptap/starter-kit": "^3.6.5",
  "@tiptap/extension-placeholder": "^3.6.5",
  "@tiptap/extension-character-count": "^3.6.5",
  "@tiptap/extension-underline": "^3.6.5",
  "@tiptap/extension-text-align": "^3.6.5"
}
```
