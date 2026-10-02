import type { EditorState, SerializedEditorState } from "lexical";

export interface SerializedChapter {
  lexical: SerializedEditorState;
  markdown: string;
  text: string;
}

export interface ChapterEditorHandle {
  focus: () => void;
  save: () => Promise<void>;
  exportContent: () => SerializedChapter | null;
}

export interface ChapterEditorProps {
  novelId: string;
  chapterId: string;
  initialContent?: SerializedEditorState | string | null;
  readonly?: boolean;
  onSave?: (content: SerializedChapter) => void | Promise<void>;
  onChange?: (state: EditorState) => void;
  ref?: React.Ref<ChapterEditorHandle>;
}

export interface WordCount {
  characters: number;
  words: number;
}
