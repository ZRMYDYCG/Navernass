import { $create, $getRoot, DecoratorNode, defineExtension } from "lexical";
import type { ReactNode } from "react";

import { $createTextParagraph } from "../manuscript-editor/plain-text";
import type { DiffHunk } from "./build-diff-hunks";
import { ReviewDiff } from "./review-diff";

/** 审阅文档里的差异块；仅存在于只读的审阅会话中，不参与序列化与保存。 */
export class DiffHunkNode extends DecoratorNode<ReactNode> {
  __hunkId = "";

  $config() {
    return this.config("diff-hunk", { extends: DecoratorNode });
  }

  afterCloneFrom(prevNode: this) {
    super.afterCloneFrom(prevNode);
    this.__hunkId = prevNode.__hunkId;
  }

  createDOM() {
    return document.createElement("div");
  }

  updateDOM() {
    return false;
  }

  isInline(): false {
    return false;
  }

  decorate() {
    return <ReviewDiff hunkId={this.__hunkId} />;
  }
}

function $createDiffHunkNode(hunkId: string) {
  const node = $create(DiffHunkNode);
  node.__hunkId = hunkId;
  return node;
}

export const ProposalReviewExtension = defineExtension({
  name: "@narraverse/proposal-review",
  nodes: () => [DiffHunkNode],
});

/** 未改动的段落照常渲染，每个差异块替换掉它覆盖的原文段落。 */
export function $setReviewDocument(text: string, hunks: DiffHunk[]) {
  const lines = text.split("\n");
  const root = $getRoot().clear();
  let line = 0;
  for (const hunk of hunks) {
    for (; line < hunk.fromLine; line += 1) root.append($createTextParagraph(lines[line]));
    root.append($createDiffHunkNode(hunk.id));
    line = hunk.toLine;
  }
  for (; line < lines.length; line += 1) root.append($createTextParagraph(lines[line]));
}
