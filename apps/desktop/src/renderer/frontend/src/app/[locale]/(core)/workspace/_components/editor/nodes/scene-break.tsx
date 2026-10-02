import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";

export type SerializedSceneBreakNode = Spread<
  {
    blockId: string;
  },
  SerializedLexicalNode
>;

export class SceneBreakNode extends DecoratorNode<React.ReactNode> {
  __blockId: string;

  static getType(): string {
    return "scene-break";
  }

  static clone(node: SceneBreakNode): SceneBreakNode {
    return new SceneBreakNode(node.__blockId, node.__key);
  }

  static importJSON(serializedNode: SerializedSceneBreakNode): SceneBreakNode {
    return $createSceneBreakNode(serializedNode.blockId);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: () => ({
        conversion: () => ({ node: $createSceneBreakNode() }),
        priority: 0,
      }),
    };
  }

  constructor(blockId = createBlockId(), key?: NodeKey) {
    super(key);
    this.__blockId = blockId;
  }

  getBlockId(): string {
    return this.getLatest().__blockId;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement("div");
    element.dataset.blockId = this.__blockId;
    return element;
  }

  updateDOM(): false {
    return false;
  }

  exportJSON(): SerializedSceneBreakNode {
    return {
      ...super.exportJSON(),
      blockId: this.__blockId,
      type: "scene-break",
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    return { element: document.createElement("hr") };
  }

  decorate(): React.ReactNode {
    return (
      <div className="my-8 flex items-center justify-center" contentEditable={false}>
        <div className="h-px w-24 bg-border" />
        <div className="mx-3 size-1.5 rounded-full bg-muted-foreground/70" />
        <div className="h-px w-24 bg-border" />
      </div>
    );
  }
}

export function $createSceneBreakNode(blockId?: string): SceneBreakNode {
  return $applyNodeReplacement(new SceneBreakNode(blockId));
}

export function $isSceneBreakNode(node: LexicalNode | null | undefined): node is SceneBreakNode {
  return node instanceof SceneBreakNode;
}

export function createBlockId() {
  return `block_${crypto.randomUUID()}`;
}
