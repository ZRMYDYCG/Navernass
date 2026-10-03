import { BookOpenIcon, FileTextIcon, SparklesIcon, UserRoundIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import { cn } from "cn";

import type { ActivationBlock } from "./types";

const icons = {
  skill: SparklesIcon,
  novel: BookOpenIcon,
  chapter: FileTextIcon,
  character: UserRoundIcon,
};

export function CharacterAvatar({
  avatar,
  label,
  className,
  compact = false,
}: {
  avatar?: string;
  label: string;
  className?: string;
  compact?: boolean;
}) {
  const [failedAvatar, setFailedAvatar] = useState<string>();

  return (
    <span
      className={cn(
        "inline-flex size-3.5 shrink-0 items-center justify-center overflow-hidden rounded-full leading-none text-muted-foreground",
        className,
      )}
    >
      {avatar && failedAvatar !== avatar ? (
        <Image
          src={avatar}
          alt=""
          width={14}
          height={14}
          unoptimized
          className={cn("block rounded-full object-cover", compact ? "size-3" : "size-full")}
          onError={() => setFailedAvatar(avatar)}
        />
      ) : (
        <UserRoundIcon aria-label={label} className="size-full" />
      )}
    </span>
  );
}

export function activationToken(block: ActivationBlock) {
  return `${block.kind === "skill" ? "/" : "@"}${block.label}`;
}

export function activationPattern(blocks: ActivationBlock[]) {
  return new RegExp(
    [...new Set(blocks.map(activationToken))]
      .map((token) => escapeRegExp(token))
      .sort((a, b) => b.length - a.length)
      .join("|"),
    "g",
  );
}

export function Activation({
  block,
  selected,
  onRemove,
}: {
  block: ActivationBlock;
  selected?: boolean;
  onRemove?: () => void;
}) {
  const Icon = icons[block.kind];
  const icon =
    block.kind === "character" ? (
      <CharacterAvatar avatar={block.avatar} label={block.label} compact />
    ) : (
      <Icon className="size-3.5" />
    );
  return (
    <span
      className={cn(
        "group/chip mx-0.5 my-0.5 inline-flex h-5 items-center gap-1 rounded-md bg-secondary px-1.5 align-middle text-sm font-medium whitespace-nowrap text-secondary-foreground",
        selected && "bg-accent text-accent-foreground ring-1 ring-ring",
      )}
    >
      {onRemove ? (
        <button
          type="button"
          aria-label={block.label}
          className="inline-flex size-3.5 items-center justify-center"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onRemove}
        >
          <span className="inline-flex size-3.5 items-center justify-center group-hover/chip:hidden">
            {icon}
          </span>
          <XIcon className="hidden size-3.5 group-hover/chip:block" />
        </button>
      ) : (
        icon
      )}
      {block.label}
    </span>
  );
}

export function ActivationText({ text, blocks }: { text: string; blocks: ActivationBlock[] }) {
  if (!blocks.length) return text;
  const byToken = new Map(blocks.map((block) => [activationToken(block), block]));
  const pattern = activationPattern(blocks);
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
