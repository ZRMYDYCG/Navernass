"use client";

import { BookmarkPlusIcon, BrainIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import {
  saveMemoryInputSchema,
  searchMemoryInputSchema,
  searchMemoryOutputSchema,
} from "@/schemas/agent-tool.schema";

import { ToolExcerpt, ToolMeta } from "../tool-shell";
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
    <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
      {output.map((hit) => (
        <li key={hit.id} className="flex flex-col gap-1 rounded-md bg-muted px-2.5 py-1.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <Badge variant="outline">{t(`memoryKind.${hit.kind}`)}</Badge>
            {hit.title ? (
              <span className="min-w-0 truncate text-xs font-medium text-foreground">
                {hit.title}
              </span>
            ) : null}
            <span className="ms-auto shrink-0 text-xs text-muted-foreground tabular-nums">
              {t("detail.score", { score: Math.round(hit.score * 100) })}
            </span>
          </div>
          <p className="line-clamp-3 text-xs leading-relaxed text-foreground/80">{hit.content}</p>
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
