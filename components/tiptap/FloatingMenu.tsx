import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

interface FloatingMenuProps {
  editor: Editor | null;
}

export function FloatingMenu({ editor }: FloatingMenuProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (!hasSelection) {
        setShow(false);
        return;
      }

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        if (rect) {
          setPosition({
            top: rect.top - 50,
            left: rect.left + rect.width / 2,
          });
          setShow(true);
        }
      }
    };

    editor.on("selectionUpdate", updateMenu);
    editor.on("update", updateMenu);

    return () => {
      editor.off("selectionUpdate", updateMenu);
      editor.off("update", updateMenu);
    };
  }, [editor]);

  if (!show || !editor) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
        zIndex: 50,
      }}
      className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive("bold")
            ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300"
        }`}
        title="加粗"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive("italic")
            ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300"
        }`}
        title="斜体"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive("underline")
            ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300"
        }`}
        title="下划线"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive("heading", { level: 1 })
            ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300"
        }`}
        title="标题 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive("heading", { level: 2 })
            ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300"
        }`}
        title="标题 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive("heading", { level: 3 })
            ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300"
        }`}
        title="标题 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>
    </div>
  );
}
