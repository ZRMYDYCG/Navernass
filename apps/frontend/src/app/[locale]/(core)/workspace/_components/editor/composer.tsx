import { LexicalComposer, type InitialConfigType } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { Ref } from "react";
import { cn } from "cn";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  CLEAR_HISTORY_COMMAND,
  HISTORY_MERGE_TAG,
} from "lexical";

import { Diff } from "./diff";
import { editorNodes } from "./nodes";
import { ShortcutsPlugin } from "./plugins/shortcuts";
import { SlashCommandPlugin } from "./plugins/slash-command";
import { WordCountPlugin } from "./plugins/word-count";
import { $readPlainText, serializeEditorState } from "./serialization";
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
          ? () => $setPlainText(props.initialContent as string)
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
  initialContent,
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
  const [review, setReview] = useState<{ before: string; after: string } | null>(null);

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

  const reviewing = review !== null;

  useEffect(() => {
    editor.setEditable(!readonly && !reviewing);
  }, [editor, readonly, reviewing]);

  // 正文被外部（如 Agent）改写后同步进编辑器；有未落库的本地修改时以本地为准，避免吞掉输入。
  useEffect(() => {
    if (typeof initialContent !== "string") return;
    if (statusStore.getSnapshot().saveState !== "saved") return;
    const current = editor.getEditorState().read($readPlainText);
    if (current === initialContent) return;
    latestState.current = null;
    editor.update(() => $setPlainText(initialContent), {
      tag: HISTORY_MERGE_TAG,
      // 连续多次改写时保留最早的原文，撤销能一次回到 Agent 动手之前。
      onUpdate: () =>
        setReview((previous) => ({ before: previous?.before ?? current, after: initialContent })),
    });
    editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
  }, [editor, initialContent, statusStore]);

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

  function resolveReview(text: string) {
    if (text !== review?.after) editor.update(() => $setPlainText(text));
    setReview(null);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <Toolbar statusStore={statusStore} readonly={readonly || reviewing} />
      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1 overflow-y-auto">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-label="章节正文编辑器"
                className={cn(
                  "mx-auto min-h-full w-full max-w-3xl px-12 py-14 text-base leading-8 outline-none",
                  "selection:bg-primary/20",
                  reviewing && "hidden",
                )}
              />
            }
            placeholder={<div className="sr-only">开始写作</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          {review ? (
            <Diff
              key={review.after}
              before={review.before}
              after={review.after}
              onResolve={resolveReview}
            />
          ) : null}
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
      </div>
      <StatusBar store={statusStore} />
    </div>
  );
}

function $setPlainText(content: string) {
  const root = $getRoot();
  root.clear();

  const lines = content.length ? content.split(/\r?\n/) : [""];
  for (const line of lines) {
    root.append($createParagraphNode().append($createTextNode(line)));
  }
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
