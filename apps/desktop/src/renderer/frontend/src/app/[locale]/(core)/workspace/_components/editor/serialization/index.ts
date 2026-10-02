import { $getRoot, type EditorState, type SerializedEditorState } from "lexical";

import type { SerializedChapter, WordCount } from "../types";

/** 每个顶层块对应正文一行，与加载时按换行拆块互为逆运算。 */
export function $readPlainText() {
  return $getRoot()
    .getChildren()
    .map((node) => node.getTextContent())
    .join("\n");
}

export function serializeEditorState(editorState: EditorState): SerializedChapter {
  const text = editorState.read($readPlainText);

  return {
    lexical: editorState.toJSON() as SerializedEditorState,
    markdown: toMarkdown(text),
    text,
  };
}

export function countWords(text: string): WordCount {
  const characters = Array.from(text.replace(/\s/g, "")).length;
  const latinWords = text.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g)?.length ?? 0;
  const cjkCharacters = text.match(/[\u3400-\u9fff]/g)?.length ?? 0;

  return {
    characters,
    words: latinWords + cjkCharacters,
  };
}

function toMarkdown(text: string) {
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
}
