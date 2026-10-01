import { $createTextNode, $getRoot, $isElementNode, type ElementNode } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CheckIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

import type { EditorDiffProposal } from "../types";

interface DiffGutterProps {
  proposals: EditorDiffProposal[];
}

export function DiffGutter({ proposals }: DiffGutterProps) {
  const [editor] = useLexicalComposerContext();
  const [resolved, setResolved] = useState<Set<string>>(() => new Set());
  const visible = useMemo(
    () => proposals.filter((proposal) => !resolved.has(proposal.id)),
    [proposals, resolved],
  );

  function reject(id: string) {
    setResolved((current) => new Set(current).add(id));
  }

  function accept(proposal: EditorDiffProposal) {
    editor.update(() => {
      const block = findBlock(proposal.operation.blockId);
      if (!block) return;

      if (proposal.operation.kind === "replace-block") {
        block.clear();
        block.append($createTextNode(proposal.operation.text));
      }

      if (proposal.operation.kind === "replace-text") {
        const text = block.getTextContent();
        const next = text.replace(proposal.operation.from, proposal.operation.to);
        block.clear();
        block.append($createTextNode(next));
      }
    });
    reject(proposal.id);
  }

  if (visible.length === 0) return null;

  return (
    <aside className="hidden w-72 shrink-0 border-l border-border bg-muted/20 p-3 lg:block">
      <div className="mb-3 text-xs font-medium text-muted-foreground">Agent diff</div>
      <div className="space-y-3">
        {visible.map((proposal) => (
          <div
            key={proposal.id}
            className="rounded-lg border border-border bg-background p-3 shadow-xs"
          >
            <div className="text-sm font-medium">{proposal.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {proposal.source} · {proposal.reason}
            </div>
            <DiffPreview proposal={proposal} />
            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => reject(proposal.id)}
              >
                <XIcon />
              </Button>
              <Button type="button" size="icon-sm" onClick={() => accept(proposal)}>
                <CheckIcon />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function DiffPreview({ proposal }: { proposal: EditorDiffProposal }) {
  if (proposal.operation.kind === "replace-block") {
    return (
      <div className="mt-3 rounded-md bg-primary/10 p-2 text-xs">{proposal.operation.text}</div>
    );
  }

  return (
    <div className="mt-3 space-y-1 text-xs">
      <div className="rounded-md bg-destructive/10 p-2 line-through">{proposal.operation.from}</div>
      <div className="rounded-md bg-primary/10 p-2">{proposal.operation.to}</div>
    </div>
  );
}

function findBlock(blockId: string): ElementNode | null {
  for (const node of $getRoot().getChildren()) {
    if (!$isElementNode(node)) continue;
    if (node.getKey() === blockId || blockId === "root") return node;
  }

  return null;
}
