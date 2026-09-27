"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useEffectEvent } from "react";

import { $getPlainText } from "./plain-text";

/** 只在纯文本真正变化时通知；选区移动、格式切换等不改变正文的更新会被忽略。 */
export function TextChangePlugin({ onTextChange }: { onTextChange: (text: string) => void }) {
  const [editor] = useLexicalComposerContext();
  const emitTextChange = useEffectEvent(onTextChange);

  useEffect(() => {
    let previousText = editor.getEditorState().read($getPlainText);
    return editor.registerUpdateListener(
      ({ editorState, prevEditorState, dirtyElements, dirtyLeaves }) => {
        const text = editorState.read($getPlainText);
        // 初始内容异步提交，这次更新只同步基线，不算用户编辑。
        if (prevEditorState.isEmpty()) {
          previousText = text;
          return;
        }
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
        if (text === previousText) return;
        previousText = text;
        emitTextChange(text);
      },
    );
  }, [editor]);

  return null;
}
