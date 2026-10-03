import { BookOpenIcon, FileTextIcon, SparklesIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { ActivationBlock } from "./types";

const icons = { skill: SparklesIcon, novel: BookOpenIcon, chapter: FileTextIcon };

export function Activation({ block, onRemove }: { block: ActivationBlock; onRemove?: () => void }) {
  const Icon = icons[block.kind];
  return (
    <span className="group/chip mx-0.5 inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 align-middle text-sm font-medium whitespace-nowrap text-secondary-foreground">
      {onRemove ? (
        <button
          type="button"
          aria-label={block.label}
          className="inline-flex size-3.5 items-center justify-center"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onRemove}
        >
          <Icon className="size-3.5 group-hover/chip:hidden" />
          <XIcon className="hidden size-3.5 group-hover/chip:block" />
        </button>
      ) : (
        <Icon className="size-3.5" />
      )}
      {block.label}
    </span>
  );
}

export function ActivationText({ text, blocks }: { text: string; blocks: ActivationBlock[] }) {
  if (!blocks.length) return text;
  const byToken = new Map(
    blocks.map((block) => [`${block.kind === "skill" ? "/" : "@"}${block.label}`, block]),
  );
  const pattern = new RegExp(
    [...byToken.keys()]
      .map((token) => escapeRegExp(token))
      .sort((a, b) => b.length - a.length)
      .join("|"),
    "g",
  );
  const content: ReactNode[] = [];
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index;
    if (index > offset) content.push(text.slice(offset, index));
    const block = byToken.get(match[0]);
    if (block)
      content.push(<Activation key={`${block.kind}:${block.id}:${index}`} block={block} />);
    offset = index + match[0].length;
  }
  if (offset < text.length) content.push(text.slice(offset));
  return content;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
