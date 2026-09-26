"use client";

import { BookmarkPlusIcon, BrainIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { z } from "zod";

import {
  saveMemoryInputSchema,
  searchMemoryInputSchema,
  searchMemoryOutputSchema,
} from "@/schemas/agent-tool.schema";

import { ToolExcerpt, ToolMeta } from "../activity/tool-detail";
import { defineTool, quote, type ToolProps } from "./define";

type SearchMemoryProps = ToolProps<
  z.infer<typeof searchMemoryInputSchema>,
  z.infer<typeof searchMemoryOutputSchema>
>;

function SearchMemoryDetail({ output }: SearchMemoryProps) {
  const t = useTranslations("agui");
  if (!output) return null;
  if (!output.length) return <ToolMeta items={[t("detail.noHit")]} />;
  return (
    <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto">
      {output.map((hit) => (
        <li key={hit.id} className="flex flex-col gap-1">
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground/70">
            <span className="shrink-0">{t(`memoryKind.${hit.kind}`)}</span>
            {hit.title ? <span className="min-w-0 truncate">· {hit.title}</span> : null}
            <span className="shrink-0 tabular-nums">
              · {t("detail.score", { score: Math.round(hit.score * 100) })}
            </span>
          </div>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {hit.content}
          </p>
        </li>
      ))}
    </ul>
  );
}

export const searchMemory = defineTool({
  icon: BrainIcon,
  input: searchMemoryInputSchema,
  output: searchMemoryOutputSchema,
  summary: (t, { input, output }) => {
    if (!input) return undefined;
    if (!output) return quote(input.query);
    return `${quote(input.query)} · ${t("detail.hitCount", { count: output.length })}`;
  },
  Detail: SearchMemoryDetail,
});

type SaveMemoryProps = ToolProps<z.infer<typeof saveMemoryInputSchema>, unknown>;

function SaveMemoryDetail({ input }: SaveMemoryProps) {
  return input ? <ToolExcerpt>{input.content}</ToolExcerpt> : null;
}

export const saveMemory = defineTool({
  icon: BookmarkPlusIcon,
  input: saveMemoryInputSchema,
  summary: (t, { input }) => (input ? (input.title ?? t(`memoryKind.${input.kind}`)) : undefined),
  Detail: SaveMemoryDetail,
});
