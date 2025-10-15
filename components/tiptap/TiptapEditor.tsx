import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { FloatingMenu } from "./FloatingMenu";

export interface TiptapEditorStats {
  words: number;
  characters: number;
}

export interface TiptapEditorProps {
  content?: string;
  placeholder?: string;
  onUpdate?: (content: string) => void;
  onStatsChange?: (stats: TiptapEditorStats) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
  className?: string;
  editable?: boolean;
}

export function TiptapEditor({
  content = "",
  placeholder = "开始写作...",
  onUpdate,
  onStatsChange,
  autoSave = true,
  autoSaveDelay = 3000,
  className = "",
  editable = true,
}: TiptapEditorProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-gray max-w-none focus:outline-none min-h-full",
      },
    },
    onUpdate: ({ editor }) => {
      // 更新字数统计
      if (onStatsChange) {
        onStatsChange({
          words: editor.storage.characterCount.words(),
          characters: editor.storage.characterCount.characters(),
        });
      }

      // 处理内容更新
      if (onUpdate) {
        if (autoSave) {
          // 自动保存：延迟后保存
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          saveTimeoutRef.current = setTimeout(() => {
            onUpdate(editor.getHTML());
          }, autoSaveDelay);
        } else {
          // 立即回调
          onUpdate(editor.getHTML());
        }
      }
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // 动态更新编辑器的可编辑状态
  useEffect(() => {
    if (editor) {
      console.log("Setting editable to:", editable);
      editor.setEditable(editable);
      // 添加视觉提示 - 使用 setAttribute 避免 immutability 问题
      const editorElement = editor.view.dom;
      if (editable) {
        editorElement.setAttribute("style", "cursor: text; opacity: 1;");
      } else {
        editorElement.setAttribute("style", "cursor: default; opacity: 0.8;");
      }
    }
  }, [editor, editable]);

  if (!editor) {
    return null;
  }

  return (
    <div className={className}>
      {editable && <FloatingMenu editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

// 导出 editor 实例的 hook，用于获取字数等统计信息
export function useTiptapEditor(content?: string) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CharacterCount,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-gray max-w-none focus:outline-none min-h-full",
      },
    },
  });

  return editor;
}
