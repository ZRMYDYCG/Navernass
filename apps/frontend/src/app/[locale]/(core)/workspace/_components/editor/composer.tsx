import { LexicalComposer, type InitialConfigType } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import type { Ref } from "react";
import { cn } from "cn";
import { $createParagraphNode, $createTextNode, $getRoot, type LexicalEditor } from "lexical";

import { DiffGutter } from "./diff";
import { editorNodes } from "./nodes";
import { ShortcutsPlugin } from "./plugins/shortcuts";
import { SlashCommandPlugin } from "./plugins/slash-command";
import { WordCountPlugin } from "./plugins/word-count";
import { serializeEditorState } from "./serialization";
import { EditorStatusStore, useEditorStatus } from "./status";
import { editorTheme } from "./theme";
import { Toolbar } from "./toolbar";
import type { ChapterEditorHandle, ChapterEditorProps } from "./types";

interface EditorShellProps extends ChapterEditorProps {
  handleRef?: Ref<ChapterEditorHandle>;
}

export function EditorComposer(props: EditorShellProps) {
  const initialConfig = useMemo<InitialConfigType>(
    () => ({
      namespace: `ChapterEditor:${props.novelId}:${props.chapterId}`,
      theme: editorTheme,
      nodes: editorNodes,
      editable: !props.readonly,
      editorState:
        typeof props.initialContent === "string"
          ? (editor) => initializePlainText(editor, props.initialContent as string)
          : props.initialContent
            ? JSON.stringify(props.initialContent)
            : undefined,
      onError: (error) => {
        throw error;
      },
    }),
    [props.chapterId, props.initialContent, props.novelId, props.readonly],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorShell {...props} />
    </LexicalComposer>
  );
}

function EditorShell({
  readonly = false,
  pendingDiffs,
  onChange,
  onSave,
  handleRef,
}: EditorShellProps) {
  const [editor] = useLexicalComposerContext();
  const statusStore = useMemo(() => new EditorStatusStore(), []);
  const latestState = useRef<ReturnType<typeof editor.getEditorState> | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onChangeRef.current = onChange;
    onSaveRef.current = onSave;
  }, [onChange, onSave]);

  const save = useCallback(async () => {
    const state = latestState.current ?? editor.getEditorState();
    const content = serializeEditorState(state);
    statusStore.setSaveState("saving");
    try {
      await onSaveRef.current?.(content);
      statusStore.setSaveState("saved");
    } catch {
      statusStore.setSaveState("pending");
    }
  }, [editor, statusStore]);

  useEffect(() => {
    editor.setEditable(!readonly);
  }, [editor, readonly]);

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  useImperativeHandle(
    handleRef,
    () => ({
      focus: () => editor.focus(),
      save,
      exportContent: () => {
        const state = latestState.current ?? editor.getEditorState();
        return serializeEditorState(state);
      },
    }),
    [editor, save],
  );

  const diffs = pendingDiffs ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <Toolbar statusStore={statusStore} readonly={readonly} />
      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1 overflow-y-auto">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-label="章节正文编辑器"
                className={cn(
                  "mx-auto min-h-full w-full max-w-3xl px-12 py-14 text-base leading-8 outline-none",
                  "selection:bg-primary/20",
                )}
              />
            }
            placeholder={<div className="sr-only">开始写作</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin
            ignoreSelectionChange
            onChange={(editorState) => {
              latestState.current = editorState;
              onChangeRef.current?.(editorState);

              if (readonly) return;
              statusStore.setSaveState("pending");
              if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
              autosaveTimer.current = setTimeout(save, 900);
            }}
          />
          <HistoryPlugin />
          <ListPlugin />
          <SlashCommandPlugin />
          <ShortcutsPlugin onSave={save} />
          <WordCountPlugin store={statusStore} />
        </div>
        <DiffGutter proposals={diffs} />
      </div>
      <StatusBar store={statusStore} />
    </div>
  );
}

function initializePlainText(editor: LexicalEditor, content: string) {
  editor.update(() => {
    const root = $getRoot();
    root.clear();

    const lines = content.length ? content.split(/\r?\n/) : [""];
    for (const line of lines) {
      root.append($createParagraphNode().append($createTextNode(line)));
    }
  });
}

function StatusBar({ store }: { store: EditorStatusStore }) {
  const status = useEditorStatus(store);

  return (
    <div className="flex h-8 shrink-0 items-center justify-end gap-4 border-t border-border px-4 text-xs text-muted-foreground">
      <span>{status.count.characters} 字符</span>
      <span>{status.count.words} 词</span>
    </div>
  );
}
