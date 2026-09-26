"use client";

import { $getRoot, COMMAND_PRIORITY_NORMAL, KEY_ENTER_COMMAND, type EditorState } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalComposer, type InitialConfigType } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { useEffect, useImperativeHandle, useRef } from "react";
import type { ReactNode, Ref } from "react";
import { cn } from "cn";

const EDITOR_CONFIG: InitialConfigType = {
  namespace: "PromptInput",
  theme: {},
  nodes: [],
  onError: (error) => {
    throw error;
  },
};

export interface PromptInputHandle {
  clear: () => void;
  focus: () => void;
}

interface PromptInputProps {
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  /** 编辑区底部的操作行（发送、停止等按钮）。 */
  addon?: ReactNode;
  onChange?: (text: string) => void;
  /** Enter 发送，Shift+Enter 换行，输入法组合中的 Enter 不触发。 */
  onSubmit?: () => void;
  ref?: Ref<PromptInputHandle>;
}

function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

function PromptInputEditor({
  placeholder,
  disabled = false,
  ariaLabel,
  onChange,
  onSubmit,
  handleRef,
}: {
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  onChange?: (text: string) => void;
  onSubmit?: () => void;
  handleRef?: Ref<PromptInputHandle>;
}) {
  const [editor] = useLexicalComposerContext();
  const onChangeRef = useLatest(onChange);
  const onSubmitRef = useLatest(onSubmit);

  useEffect(() => {
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        if (!event || disabled) return false;
        if (event.shiftKey) return false;
        if (event.isComposing || event.keyCode === 229) return false;
        event.preventDefault();
        onSubmitRef.current?.();
        return true;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [disabled, editor, onSubmitRef]);

  useImperativeHandle(
    handleRef,
    () => ({
      clear: () => {
        editor.update(() => {
          $getRoot().clear();
        });
      },
      focus: () => {
        editor.focus();
      },
    }),
    [editor],
  );

  return (
    <>
      <PlainTextPlugin
        contentEditable={
          <ContentEditable
            data-slot="prompt-input-control"
            aria-label={ariaLabel}
            aria-disabled={disabled || undefined}
            className="max-h-48 min-h-20 flex-1 overflow-y-auto px-2.5 py-2 text-sm whitespace-pre-wrap outline-none"
          />
        }
        placeholder={
          placeholder ? (
            <div className="pointer-events-none absolute top-2 left-2.5 text-sm text-muted-foreground select-none">
              {placeholder}
            </div>
          ) : null
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin
        onChange={(editorState: EditorState) => {
          onChangeRef.current?.(editorState.read(() => $getRoot().getTextContent()));
        }}
      />
      <HistoryPlugin />
    </>
  );
}

export function PromptInput({
  placeholder,
  disabled = false,
  ariaLabel,
  className,
  addon,
  onChange,
  onSubmit,
  ref,
}: PromptInputProps) {
  return (
    <div
      data-slot="prompt-input"
      data-disabled={disabled || undefined}
      className={cn(
        "relative flex flex-col rounded-lg border border-input bg-transparent transition-colors outline-none",
        "has-[[data-slot=prompt-input-control]:focus-visible]:border-ring has-[[data-slot=prompt-input-control]:focus-visible]:ring-3 has-[[data-slot=prompt-input-control]:focus-visible]:ring-ring/50",
        "data-disabled:bg-input/50 data-disabled:opacity-50",
        className,
      )}
    >
      <LexicalComposer initialConfig={EDITOR_CONFIG}>
        <PromptInputEditor
          placeholder={placeholder}
          disabled={disabled}
          ariaLabel={ariaLabel}
          onChange={onChange}
          onSubmit={onSubmit}
          handleRef={ref}
        />
      </LexicalComposer>
      {addon ? <div className="flex items-center justify-end px-2 pb-2">{addon}</div> : null}
    </div>
  );
}
