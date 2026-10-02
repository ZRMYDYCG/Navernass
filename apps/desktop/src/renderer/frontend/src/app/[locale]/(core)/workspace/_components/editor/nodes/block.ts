import { ListItemNode, type SerializedListItemNode } from "@lexical/list";
import {
  HeadingNode,
  QuoteNode,
  type HeadingTagType,
  type SerializedHeadingNode,
  type SerializedQuoteNode,
} from "@lexical/rich-text";
import {
  $applyNodeReplacement,
  ParagraphNode,
  type LexicalNode,
  type LexicalNodeReplacement,
  type NodeKey,
  type SerializedParagraphNode,
  type SerializedPartial,
} from "lexical";

import { createBlockId } from "./scene-break";

interface SerializedBlockId {
  blockId: string;
}

export class BlockParagraphNode extends ParagraphNode {
  __blockId: string;

  static clone(node: BlockParagraphNode): BlockParagraphNode {
    return new BlockParagraphNode(node.__blockId, node.__key);
  }

  static importJSON(
    serializedNode: SerializedParagraphNode & Partial<SerializedBlockId>,
  ): BlockParagraphNode {
    return $createBlockParagraphNode(serializedNode.blockId).updateFromJSON(serializedNode);
  }

  constructor(blockId = createBlockId(), key?: NodeKey) {
    super(key);
    this.__blockId = blockId;
  }

  getBlockId(): string {
    return this.getLatest().__blockId;
  }

  exportJSON(compact?: false): SerializedParagraphNode & SerializedBlockId;
  exportJSON(compact: boolean): SerializedPartial<SerializedParagraphNode & SerializedBlockId>;
  exportJSON(compact = false): SerializedPartial<SerializedParagraphNode & SerializedBlockId> {
    return {
      ...super.exportJSON(compact),
      blockId: this.__blockId,
    };
  }
}

export class BlockHeadingNode extends HeadingNode {
  __blockId: string;

  static clone(node: BlockHeadingNode): BlockHeadingNode {
    return new BlockHeadingNode(node.getTag(), node.__blockId, node.__key);
  }

  static importJSON(
    serializedNode: SerializedHeadingNode & Partial<SerializedBlockId>,
  ): BlockHeadingNode {
    return $createBlockHeadingNode(serializedNode.tag, serializedNode.blockId).updateFromJSON(
      serializedNode,
    );
  }

  constructor(tag: HeadingTagType = "h1", blockId = createBlockId(), key?: NodeKey) {
    super(tag, key);
    this.__blockId = blockId;
  }

  getBlockId(): string {
    return this.getLatest().__blockId;
  }

  exportJSON(compact?: false): SerializedHeadingNode & SerializedBlockId;
  exportJSON(compact: boolean): SerializedPartial<SerializedHeadingNode & SerializedBlockId>;
  exportJSON(compact = false): SerializedPartial<SerializedHeadingNode & SerializedBlockId> {
    return {
      ...super.exportJSON(compact),
      blockId: this.__blockId,
    };
  }
}

export class BlockQuoteNode extends QuoteNode {
  __blockId: string;

  static clone(node: BlockQuoteNode): BlockQuoteNode {
    return new BlockQuoteNode(node.__blockId, node.__key);
  }

  static importJSON(
    serializedNode: SerializedQuoteNode & Partial<SerializedBlockId>,
  ): BlockQuoteNode {
    return $createBlockQuoteNode(serializedNode.blockId).updateFromJSON(serializedNode);
  }

  constructor(blockId = createBlockId(), key?: NodeKey) {
    super(key);
    this.__blockId = blockId;
  }

  getBlockId(): string {
    return this.getLatest().__blockId;
  }

  exportJSON(compact?: false): SerializedQuoteNode & SerializedBlockId;
  exportJSON(compact: boolean): SerializedPartial<SerializedQuoteNode & SerializedBlockId>;
  exportJSON(compact = false): SerializedPartial<SerializedQuoteNode & SerializedBlockId> {
    return {
      ...super.exportJSON(compact),
      blockId: this.__blockId,
    };
  }
}

export class BlockListItemNode extends ListItemNode {
  __blockId: string;

  static clone(node: BlockListItemNode): BlockListItemNode {
    return new BlockListItemNode(node.getValue(), node.getChecked(), node.__blockId, node.__key);
  }

  static importJSON(
    serializedNode: SerializedListItemNode & Partial<SerializedBlockId>,
  ): BlockListItemNode {
    return $createBlockListItemNode(
      serializedNode.value,
      serializedNode.checked,
      serializedNode.blockId,
    ).updateFromJSON(serializedNode);
  }

  constructor(
    value = 1,
    checked: boolean | undefined = undefined,
    blockId = createBlockId(),
    key?: NodeKey,
  ) {
    super(value, checked, key);
    this.__blockId = blockId;
  }

  getBlockId(): string {
    return this.getLatest().__blockId;
  }

  exportJSON(compact?: false): SerializedListItemNode & SerializedBlockId;
  exportJSON(compact: boolean): SerializedPartial<SerializedListItemNode & SerializedBlockId>;
  exportJSON(compact = false): SerializedPartial<SerializedListItemNode & SerializedBlockId> {
    return {
      ...super.exportJSON(compact),
      blockId: this.__blockId,
    };
  }
}

export function $createBlockParagraphNode(blockId?: string): BlockParagraphNode {
  return $applyNodeReplacement(new BlockParagraphNode(blockId));
}

export function $createBlockHeadingNode(tag: HeadingTagType, blockId?: string): BlockHeadingNode {
  return $applyNodeReplacement(new BlockHeadingNode(tag, blockId));
}

export function $createBlockQuoteNode(blockId?: string): BlockQuoteNode {
  return $applyNodeReplacement(new BlockQuoteNode(blockId));
}

export function $createBlockListItemNode(
  value?: number,
  checked?: boolean,
  blockId?: string,
): BlockListItemNode {
  return $applyNodeReplacement(new BlockListItemNode(value, checked, blockId));
}

export function getBlockId(node: LexicalNode): string | null {
  if (
    node instanceof BlockParagraphNode ||
    node instanceof BlockHeadingNode ||
    node instanceof BlockQuoteNode ||
    node instanceof BlockListItemNode
  ) {
    return node.getBlockId();
  }

  return null;
}

export const blockNodeReplacements: LexicalNodeReplacement[] = [
  {
    replace: ParagraphNode,
    with: () => $createBlockParagraphNode(),
    withKlass: BlockParagraphNode,
  },
  {
    replace: HeadingNode,
    with: (node: HeadingNode) => $createBlockHeadingNode(node.getTag()),
    withKlass: BlockHeadingNode,
  },
  {
    replace: QuoteNode,
    with: () => $createBlockQuoteNode(),
    withKlass: BlockQuoteNode,
  },
  {
    replace: ListItemNode,
    with: (node: ListItemNode) => $createBlockListItemNode(node.getValue(), node.getChecked()),
    withKlass: BlockListItemNode,
  },
];
