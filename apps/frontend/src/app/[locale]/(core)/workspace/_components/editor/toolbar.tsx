import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Redo2Icon,
  SeparatorHorizontalIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { $createSceneBreakNode } from "./nodes/scene-break";
import { useEditorStatus, type EditorStatusStore } from "./status";

interface ToolbarProps {
  statusStore: EditorStatusStore;
  readonly?: boolean;
}

export function Toolbar({ statusStore, readonly = false }: ToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const status = useEditorStatus(statusStore);

  function formatBlock(kind: "h1" | "h2" | "quote") {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (kind === "quote") {
        $setBlocksType(selection, () => $createQuoteNode());
      } else {
        $setBlocksType(selection, () => $createHeadingNode(kind));
      }
    });
  }

  function insertSceneBreak() {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      selection.insertNodes([$createSceneBreakNode(), $createParagraphNode()]);
    });
  }

  return (
    <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border bg-background/95 px-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        title="一级标题"
        disabled={readonly}
        onClick={() => formatBlock("h1")}
      >
        H1
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        title="二级标题"
        disabled={readonly}
        onClick={() => formatBlock("h2")}
      >
        H2
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="引用"
        disabled={readonly}
        onClick={() => formatBlock("quote")}
      >
        <QuoteIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="场景分隔"
        disabled={readonly}
        onClick={insertSceneBreak}
      >
        <SeparatorHorizontalIcon />
      </Button>
      <div className="mx-1 h-5 w-px bg-border" />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="加粗"
        disabled={readonly}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <BoldIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="斜体"
        disabled={readonly}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <ItalicIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="下划线"
        disabled={readonly}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <UnderlineIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="无序列表"
        disabled={readonly}
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      >
        <ListIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="有序列表"
        disabled={readonly}
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
      >
        <ListOrderedIcon />
      </Button>
      <div className="ml-auto flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="撤销"
          disabled={readonly}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        >
          <Undo2Icon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="重做"
          disabled={readonly}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        >
          <Redo2Icon />
        </Button>
        <SaveState readonly={readonly} saveState={status.saveState} />
      </div>
    </div>
  );
}

function SaveState({
  readonly,
  saveState,
}: {
  readonly: boolean;
  saveState: "saved" | "saving" | "pending";
}) {
  if (readonly) {
    return <div className="px-2 text-xs text-muted-foreground">只读</div>;
  }

  if (saveState === "saved") return null;

  return <div className="px-2 text-xs text-muted-foreground">保存中...</div>;
}
