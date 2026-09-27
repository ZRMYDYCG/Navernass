"use client";

import { HistoryExtension } from "@lexical/history";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { RichTextExtension } from "@lexical/rich-text";
import { defineExtension, type AnyLexicalExtensionArgument } from "lexical";
import { memo, useState, type ReactNode } from "react";

import { TextChangePlugin } from "./text-change-plugin";

interface ManuscriptEditorProps {
  /** 构建初始文档的 Lexical 更新函数。与下面的配置一样只在挂载时读取，切换文档请更换 `key`。 */
  $initialContent: () => void;
  editable?: boolean;
  /** 业务扩展（自定义节点、命令等），与内置的富文本、撤销能力一起注册。 */
  extensions?: AnyLexicalExtensionArgument[];
  placeholder: string;
  onTextChange?: (text: string) => void;
  /** 编辑器插件，可通过 `useLexicalComposerContext` 访问编辑器实例。 */
  children?: ReactNode;
}

export const ManuscriptEditor = memo(function ManuscriptEditor({
  $initialContent,
  editable = true,
  extensions = [],
  placeholder,
  onTextChange,
  children,
}: ManuscriptEditorProps) {
  const [extension] = useState(() =>
    defineExtension({
      name: "@narraverse/manuscript-editor",
      namespace: "manuscript",
      editable,
      dependencies: [RichTextExtension, HistoryExtension, ...extensions],
      $initialEditorState: $initialContent,
    }),
  );

  return (
    <LexicalExtensionComposer extension={extension} contentEditable={null}>
      <div className="relative">
        <ContentEditable
          aria-placeholder={placeholder}
          placeholder={
            <div className="pointer-events-none absolute inset-x-0 top-0 font-serif text-lg/loose text-muted-foreground select-none">
              {placeholder}
            </div>
          }
          className="min-h-96 font-serif text-lg/loose text-foreground caret-ring outline-none *:mb-3"
        />
      </div>
      {onTextChange ? <TextChangePlugin onTextChange={onTextChange} /> : null}
      {children}
    </LexicalExtensionComposer>
  );
});
