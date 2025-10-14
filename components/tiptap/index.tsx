"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect } from "react";

interface TiptapEditorProps {
  content?: string;
  placeholder?: string;
  onUpdate?: (content: string) => void;
  onStatsChange?: (stats: { words: number; characters: number }) => void;
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
  className = "",
  editable = true,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CharacterCount,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate?.(html);

      // 计算字数和字符数
      const stats = {
        words: editor.storage.characterCount.words(),
        characters: editor.storage.characterCount.characters(),
      };
      onStatsChange?.(stats);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`tiptap-editor ${className}`}>
      <EditorContent editor={editor} className="prose dark:prose-invert max-w-none focus:outline-none" />
    </div>
  );
}
