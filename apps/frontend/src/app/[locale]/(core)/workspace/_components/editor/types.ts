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
  pendingDiffs?: EditorDiffProposal[];
  onSave?: (content: SerializedChapter) => void | Promise<void>;
  onChange?: (state: EditorState) => void;
  ref?: React.Ref<ChapterEditorHandle>;
}

export type EditorDiffOperation =
  | {
      kind: "replace-block";
      blockId: string;
      text: string;
    }
  | {
      kind: "replace-text";
      blockId: string;
      from: string;
      to: string;
    };

export interface EditorDiffProposal {
  id: string;
  title: string;
  source: string;
  reason: string;
  createdAt: string;
  operation: EditorDiffOperation;
}

export interface WordCount {
  characters: number;
  words: number;
}
