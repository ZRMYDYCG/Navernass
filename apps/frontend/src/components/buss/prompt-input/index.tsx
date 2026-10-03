"use client";

import type { ReactNode, Ref } from "react";
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "cn";
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isTextNode,
  $nodesOfType,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_NORMAL,
  DecoratorNode,
  KEY_ENTER_COMMAND,
  type EditorConfig,
  type EditorState,
  type NodeKey,
  type SerializedLexicalNode,
} from "lexical";
import { LexicalComposer, type InitialConfigType } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";

import { Activation } from "./activation";
import type { ActivationBlock, ActivationSuggestion } from "./types";

type SerializedActivationNode = SerializedLexicalNode &
  ActivationBlock & { type: "activation"; version: 1 };

class ActivationNode extends DecoratorNode<ReactNode> {
  __block: ActivationBlock;
  static getType() {
    return "activation";
  }
  static clone(node: ActivationNode) {
    return new ActivationNode(node.__block, node.__key);
  }
  static importJSON(value: SerializedLexicalNode & Partial<ActivationBlock>) {
    return new ActivationNode({
      kind: value.kind ?? "chapter",
      id: value.id ?? "",
      label: value.label ?? "",
    });
  }
  constructor(block: ActivationBlock, key?: NodeKey) {
    super(key);
    this.__block = block;
  }
  createDOM(_config: EditorConfig) {
    const span = document.createElement("span");
    span.contentEditable = "false";
    return span;
  }
  updateDOM() {
    return false;
  }
  isInline() {
    return true;
  }
  getTextContent() {
    return `${this.__block.kind === "skill" ? "/" : "@"}${this.__block.label}`;
  }
  exportJSON(): SerializedActivationNode {
    return { ...super.exportJSON(), ...this.__block, type: "activation", version: 1 };
  }
  decorate() {
    return <EditableActivation block={this.__block} nodeKey={this.__key} />;
  }
}

function EditableActivation({ block, nodeKey }: { block: ActivationBlock; nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  return (
    <Activation
      block={block}
      onRemove={() => {
        editor.update(() => $getNodeByKey(nodeKey)?.remove());
        editor.focus();
      }}
    />
  );
}

function $createActivationNode(block: ActivationBlock) {
  return new ActivationNode(block);
}

const config: InitialConfigType = {
  namespace: "PromptInput",
  theme: {},
  nodes: [ActivationNode],
  onError: (error) => {
    throw error;
  },
};

export interface PromptInputHandle {
  clear: () => void;
  focus: () => void;
  insertActivation: (block: ActivationBlock) => void;
}

interface PromptInputProps {
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  addon?: ReactNode;
  initialValue?: string;
  suggestions?: ActivationSuggestion[];
  onChange?: (text: string, blocks: ActivationBlock[]) => void;
  onSubmit?: () => void;
  ref?: Ref<PromptInputHandle>;
}

function Editor({
  props,
  handleRef,
}: {
  props: PromptInputProps;
  handleRef?: Ref<PromptInputHandle>;
}) {
  const [editor] = useLexicalComposerContext();
  const [match, setMatch] = useState<{ trigger: "/" | "@"; query: string; start: number }>();
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  }, [props]);

  useEffect(() => editor.setEditable(!props.disabled), [editor, props.disabled]);
  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      if (root.getTextContent() === (props.initialValue ?? "")) return;
      root.clear();
      if (props.initialValue)
        root.append($createParagraphNode().append($createTextNode(props.initialValue)));
    });
  }, [editor, props.initialValue]);

  useEffect(
    () =>
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          if (
            !event ||
            props.disabled ||
            event.shiftKey ||
            event.isComposing ||
            event.keyCode === 229
          )
            return false;
          if (match) return false;
          event.preventDefault();
          latest.current.onSubmit?.();
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    [editor, match, props.disabled],
  );

  useImperativeHandle(
    handleRef,
    () => ({
      clear: () => editor.update(() => $getRoot().clear()),
      focus: () => editor.focus(),
      insertActivation: (block) => {
        editor.update(() => {
          let selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            $getRoot().selectEnd();
            selection = $getSelection();
          }
          if (!$isRangeSelection(selection)) return;
          selection.insertNodes([$createActivationNode(block), $createTextNode(" ")]);
        });
        editor.focus();
      },
    }),
    [editor],
  );

  const choices = (props.suggestions ?? [])
    .filter(
      (item) =>
        (match?.trigger === "/" ? item.kind === "skill" : item.kind !== "skill") &&
        item.label.toLocaleLowerCase().includes(match?.query.toLocaleLowerCase() ?? ""),
    )
    .slice(0, 8);

  const activate = useCallback(
    (block: ActivationBlock) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!match || !$isRangeSelection(selection)) return;
        const node = selection.anchor.getNode();
        if (!$isTextNode(node)) return;
        const offset = selection.anchor.offset;
        node.spliceText(match.start, offset - match.start, "");
        selection.anchor.set(node.getKey(), match.start, "text");
        selection.focus.set(node.getKey(), match.start, "text");
        selection.insertNodes([$createActivationNode(block), $createTextNode(" ")]);
      });
      setMatch(undefined);
      editor.focus();
    },
    [editor, match],
  );

  useEffect(
    () =>
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          const choice = choices[0];
          if (!event || !match || !choice) return false;
          event.preventDefault();
          activate(choice);
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    [activate, choices, editor, match],
  );

  return (
    <>
      <PlainTextPlugin
        contentEditable={
          <div className="min-w-0 flex-1">
            <ContentEditable
              data-slot="prompt-input-control"
              aria-label={props.ariaLabel}
              aria-disabled={props.disabled || undefined}
              className="max-h-48 min-h-20 overflow-y-auto px-2.5 py-2 text-sm whitespace-pre-wrap outline-none"
            />
          </div>
        }
        placeholder={
          props.placeholder ? (
            <div className="pointer-events-none absolute top-2 left-2.5 text-sm text-muted-foreground select-none">
              {props.placeholder}
            </div>
          ) : null
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin
        onChange={(state: EditorState) =>
          state.read(() => {
            const root = $getRoot();
            const blocks = $nodesOfType(ActivationNode).map((node) => node.__block);
            const selection = $getSelection();
            if ($isRangeSelection(selection) && selection.anchor.type === "text") {
              const text = selection.anchor
                .getNode()
                .getTextContent()
                .slice(0, selection.anchor.offset);
              const found = text.match(/(?:^|\s)([/@])([^\s/@]*)$/);
              setMatch(
                found
                  ? {
                      trigger: found[1] as "/" | "@",
                      query: found[2],
                      start: selection.anchor.offset - found[0].trimStart().length,
                    }
                  : undefined,
              );
            } else setMatch(undefined);
            latest.current.onChange?.(root.getTextContent(), blocks);
          })
        }
      />
      <HistoryPlugin />
      {match && choices.length ? (
        <div className="absolute right-2 bottom-full left-2 z-50 mb-1 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-md">
          {choices.map((item) => (
            <button
              key={`${item.kind}:${item.id}`}
              type="button"
              className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-start hover:bg-accent"
              onMouseDown={(event) => {
                event.preventDefault();
                activate(item);
              }}
            >
              <Activation block={item} />
              {item.description ? (
                <span className="truncate pt-0.5 text-xs text-muted-foreground">
                  {item.description}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

export function PromptInput({ ref, addon, ...props }: PromptInputProps) {
  return (
    <div
      data-slot="prompt-input"
      data-disabled={props.disabled || undefined}
      className={cn(
        "relative flex flex-col rounded-lg border border-input bg-transparent transition-colors outline-none",
        "has-[[data-slot=prompt-input-control]:focus-visible]:border-ring",
        "data-disabled:bg-input/50 data-disabled:opacity-50",
        props.className,
      )}
    >
      <LexicalComposer initialConfig={config}>
        <Editor props={props} handleRef={ref} />
      </LexicalComposer>
      {addon ? <div className="flex items-center justify-end px-2 pb-2">{addon}</div> : null}
    </div>
  );
}

export type { ActivationBlock, ActivationSuggestion } from "./types";
