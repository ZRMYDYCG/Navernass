"use client";

import type { ReactNode, Ref } from "react";
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "cn";
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $setSelection,
  $isNodeSelection,
  $nodesOfType,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_NORMAL,
  DecoratorNode,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  SELECTION_CHANGE_COMMAND,
  mergeRegister,
  type EditorConfig,
  type EditorState,
  type LexicalEditor,
  type NodeKey,
  type RangeSelection,
  type SerializedLexicalNode,
} from "lexical";
import { LexicalComposer, type InitialConfigType } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { MenuOption } from "@lexical/react/LexicalMenuOption";
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";

import { Activation, activationPattern, activationToken } from "./activation";
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
      avatar: value.avatar,
    });
  }
  constructor(block: ActivationBlock, key?: NodeKey) {
    super(key);
    this.__block = block;
  }
  createDOM(_config: EditorConfig) {
    const span = document.createElement("span");
    span.contentEditable = "false";
    span.style.display = "inline-block";
    span.style.verticalAlign = "middle";
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
  const [selected] = useLexicalNodeSelection(nodeKey);
  return (
    <Activation
      block={block}
      selected={selected}
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

function focusAfterInsertedActivation(editor: LexicalEditor, trailingSpaceKey: NodeKey) {
  requestAnimationFrame(() => {
    editor.focus(undefined, { defaultSelection: "rootEnd" });
    editor.update(
      () => {
        const trailingSpace = $getNodeByKey(trailingSpaceKey);
        // 尾随空格会与后方文本合并，只能定位到空格之后，不能 selectEnd。
        if ($isTextNode(trailingSpace)) trailingSpace.select(1, 1);
      },
      { discrete: true },
    );
  });
}

function $getSelectedActivation() {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) return;
  const nodes = selection.getNodes();
  if (nodes.length === 1 && nodes[0] instanceof ActivationNode) return nodes[0];
}

function moveFromSelectedActivation(event: KeyboardEvent, direction: "previous" | "next") {
  const node = $getSelectedActivation();
  if (!node) return false;
  event.preventDefault();
  if (direction === "previous") node.selectPrevious();
  else node.selectNext();
  return true;
}

function removeSelectedActivation(event: KeyboardEvent) {
  const node = $getSelectedActivation();
  if (!node) return false;
  event.preventDefault();
  node.remove();
  return true;
}

function suggestionScore(item: ActivationSuggestion, query: string) {
  if (!query) return 0;
  const label = item.label.toLocaleLowerCase();
  if (label === query) return 0;
  if (label.startsWith(query)) return 1;
  if (label.split(/[\s/_-]+/).some((part) => part.startsWith(query))) return 2;
  if (label.includes(query)) return 3;
  if (item.description?.toLocaleLowerCase().includes(query)) return 4;
}

class ActivationOption extends MenuOption {
  item: ActivationSuggestion;

  constructor(item: ActivationSuggestion) {
    super(`${item.kind}:${item.id}`);
    this.item = item;
  }
}

function ActivationTypeahead({
  trigger,
  suggestions,
  activeKeys,
}: {
  trigger: "/" | "@";
  suggestions: ActivationSuggestion[];
  activeKeys: Set<string>;
}) {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useState<string | null>(null);
  const triggerFn = useBasicTypeaheadTriggerMatch(trigger, {
    minLength: 0,
    maxLength: 100,
    allowWhitespace: false,
    punctuation: "\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\[\\]\\\\/!%'\"~=<>:;",
  });
  const options = useMemo(() => {
    const normalizedQuery = query?.trim().toLocaleLowerCase() ?? "";
    return suggestions
      .map((item, index) => ({
        item,
        index,
        score: suggestionScore(item, normalizedQuery),
      }))
      .filter(
        ({ item, score }) =>
          (trigger === "/" ? item.kind === "skill" : item.kind !== "skill") &&
          !activeKeys.has(`${item.kind}:${item.id}`) &&
          score !== undefined,
      )
      .sort((a, b) => a.score! - b.score! || a.index - b.index)
      .slice(0, 8)
      .map(({ item }) => new ActivationOption(item));
  }, [activeKeys, query, suggestions, trigger]);

  return (
    <LexicalTypeaheadMenuPlugin
      triggerFn={triggerFn}
      options={options}
      onQueryChange={setQuery}
      commandPriority={COMMAND_PRIORITY_HIGH}
      preselectFirstItem
      onSelectOption={(option, textNodeContainingQuery, closeMenu) => {
        if (textNodeContainingQuery) {
          const activation = $createActivationNode(option.item);
          const trailingSpace = $createTextNode(" ");
          const trailingSpaceKey = trailingSpace.getKey();
          textNodeContainingQuery.replace(activation);
          activation.insertAfter(trailingSpace);
          trailingSpace.selectEnd();
          focusAfterInsertedActivation(editor, trailingSpaceKey);
        }
        closeMenu();
      }}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) =>
        anchorElementRef.current && options.length ? (
          <PopoverPrimitive.Root open>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Positioner
                anchor={anchorElementRef}
                positionMethod="fixed"
                side="bottom"
                align="start"
                sideOffset={({ anchor }) => 6 - anchor.height}
                collisionPadding={8}
                collisionAvoidance={{ side: "none", align: "shift", fallbackAxisSide: "none" }}
                className="isolate z-50"
              >
                <PopoverPrimitive.Popup
                  initialFocus={false}
                  finalFocus={false}
                  role="listbox"
                  className="max-h-(--available-height) w-80 overflow-y-auto overscroll-contain rounded-lg border border-border bg-popover p-1 shadow-md outline-none"
                >
                  {options.map((option, index) => (
                    <button
                      key={option.key}
                      ref={(element) => option.setRefElement(element)}
                      id={`typeahead-item-${index}`}
                      role="option"
                      aria-selected={index === selectedIndex}
                      type="button"
                      data-selected={index === selectedIndex || undefined}
                      className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-start hover:bg-accent data-selected:bg-accent"
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectOptionAndCleanUp(option);
                      }}
                    >
                      <Activation block={option.item} />
                      {option.item.description ? (
                        <span className="truncate pt-0.5 text-xs text-muted-foreground">
                          {option.item.description}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </PopoverPrimitive.Popup>
              </PopoverPrimitive.Positioner>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        ) : null
      }
    />
  );
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
  header?: ReactNode;
  addon?: ReactNode;
  initialValue?: string;
  initialBlocks?: ActivationBlock[];
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
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const lastRangeSelection = useRef<RangeSelection | null>(null);
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  }, [props]);

  useEffect(() => editor.setEditable(!props.disabled), [editor, props.disabled]);
  const initialValue = props.initialValue ?? "";
  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      // initialValue 通常是编辑器自身 onChange 的回写；仅在外部文本真正变化时重建，否则会丢失光标。
      if (root.getTextContent() === initialValue) return;
      const initialBlocks = latest.current.initialBlocks ?? [];
      const hadSelection = $getSelection() !== null;
      root.clear();
      if (!initialValue) return;
      const paragraph = $createParagraphNode();
      if (!initialBlocks.length) paragraph.append($createTextNode(initialValue));
      else {
        const byToken = new Map(initialBlocks.map((block) => [activationToken(block), block]));
        let offset = 0;
        for (const match of initialValue.matchAll(activationPattern(initialBlocks))) {
          const index = match.index;
          if (index > offset) paragraph.append($createTextNode(initialValue.slice(offset, index)));
          const block = byToken.get(match[0]);
          if (block) paragraph.append($createActivationNode(block));
          offset = index + match[0].length;
        }
        if (offset < initialValue.length)
          paragraph.append($createTextNode(initialValue.slice(offset)));
      }
      root.append(paragraph);
      if (hadSelection) paragraph.selectEnd();
    });
  }, [editor, initialValue]);

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
          event.preventDefault();
          latest.current.onSubmit?.();
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    [editor, props.disabled],
  );

  useEffect(
    () =>
      mergeRegister(
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          () => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) lastRangeSelection.current = selection.clone();
            return false;
          },
          COMMAND_PRIORITY_NORMAL,
        ),
        editor.registerCommand(
          KEY_ARROW_LEFT_COMMAND,
          (event) => moveFromSelectedActivation(event, "previous"),
          COMMAND_PRIORITY_HIGH,
        ),
        editor.registerCommand(
          KEY_ARROW_RIGHT_COMMAND,
          (event) => moveFromSelectedActivation(event, "next"),
          COMMAND_PRIORITY_HIGH,
        ),
        editor.registerCommand(
          KEY_BACKSPACE_COMMAND,
          removeSelectedActivation,
          COMMAND_PRIORITY_HIGH,
        ),
        editor.registerCommand(KEY_DELETE_COMMAND, removeSelectedActivation, COMMAND_PRIORITY_HIGH),
      ),
    [editor],
  );

  useImperativeHandle(
    handleRef,
    () => ({
      clear: () => editor.update(() => $getRoot().clear()),
      focus: () => editor.focus(),
      insertActivation: (block) => {
        let trailingSpaceKey: NodeKey | undefined;
        editor.update(
          () => {
            let selection = $getSelection();
            if (!$isRangeSelection(selection)) {
              if (lastRangeSelection.current) {
                $setSelection(lastRangeSelection.current.clone());
              } else {
                const root = $getRoot();
                const paragraph = root.getLastChild() ?? $createParagraphNode();
                if (!paragraph.isAttached()) root.append(paragraph);
                paragraph.selectEnd();
              }
              selection = $getSelection();
            }
            if (!$isRangeSelection(selection)) return;
            const trailingSpace = $createTextNode(" ");
            trailingSpaceKey = trailingSpace.getKey();
            selection.insertNodes([$createActivationNode(block), trailingSpace]);
            trailingSpace.selectEnd();
          },
          { discrete: true },
        );
        if (trailingSpaceKey) focusAfterInsertedActivation(editor, trailingSpaceKey);
      },
    }),
    [editor],
  );

  return (
    <>
      <div className="relative min-w-0 flex-1">
        <PlainTextPlugin
          contentEditable={
            <ContentEditable
              data-slot="prompt-input-control"
              aria-label={props.ariaLabel}
              aria-disabled={props.disabled || undefined}
              className="max-h-48 min-h-20 overflow-y-auto px-2.5 py-2 text-sm whitespace-pre-wrap outline-none"
            />
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
      </div>
      <OnChangePlugin
        onChange={(state: EditorState) =>
          state.read(() => {
            const root = $getRoot();
            const blocks = $nodesOfType(ActivationNode).map((node) => node.__block);
            setActiveKeys(new Set(blocks.map((block) => `${block.kind}:${block.id}`)));
            latest.current.onChange?.(root.getTextContent(), blocks);
          })
        }
      />
      <HistoryPlugin />
      <ActivationTypeahead
        trigger="/"
        suggestions={props.suggestions ?? []}
        activeKeys={activeKeys}
      />
      <ActivationTypeahead
        trigger="@"
        suggestions={props.suggestions ?? []}
        activeKeys={activeKeys}
      />
    </>
  );
}

export function PromptInput({ ref, header, addon, ...props }: PromptInputProps) {
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
      {header}
      <LexicalComposer initialConfig={config}>
        <Editor props={props} handleRef={ref} />
      </LexicalComposer>
      {addon ? <div className="flex items-center justify-end px-2 pb-2">{addon}</div> : null}
    </div>
  );
}

export type { ActivationBlock, ActivationSuggestion } from "./types";
