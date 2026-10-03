"use client";

import { FileCodeIcon, FileIcon, SparklesIcon, WrenchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import {
  loadSkillInputSchema,
  loadSkillOutputSchema,
  readSkillResourceInputSchema,
  readSkillResourceOutputSchema,
} from "@/lib/http/modules/agent-tool.schema";

import { defineMaterial, ToolExcerpt, ToolField, type MaterialContext } from "../protocol";

type LoadSkillProps = MaterialContext<
  z.infer<typeof loadSkillInputSchema>,
  z.infer<typeof loadSkillOutputSchema>
>;

function SkillInstructions({ value }: { value: string }) {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-muted/50 px-3 py-2.5">
      {lines.map((line, index) => {
        const heading = line.match(/^#{1,6}\s+(.+)$/)?.[1];
        if (heading)
          return (
            <p key={`${index}-${line}`} className="text-sm font-medium text-foreground">
              {heading}
            </p>
          );

        const item = line.match(/^[-*]\s+(.+)$/)?.[1];
        if (item)
          return (
            <div
              key={`${index}-${line}`}
              className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
            >
              <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
              <span>{item}</span>
            </div>
          );

        return (
          <p key={`${index}-${line}`} className="text-sm leading-relaxed text-muted-foreground">
            {line}
          </p>
        );
      })}
    </div>
  );
}

function LoadSkillDetail({ output }: LoadSkillProps) {
  const t = useTranslations("agui.detail");
  if (!output) return null;
  return (
    <>
      {output.allowedTools.length ? (
        <ToolField label={t("allowedTools")}>
          <div className="flex flex-wrap gap-1.5">
            {output.allowedTools.map((name) => (
              <Badge key={name} variant="secondary">
                <WrenchIcon data-icon="inline-start" />
                {name}
              </Badge>
            ))}
          </div>
        </ToolField>
      ) : null}
      {output.resources.length ? (
        <ToolField label={t("resources")}>
          <ul className="flex flex-col overflow-hidden rounded-md border">
            {output.resources.map((path) => (
              <li
                key={path}
                className="flex min-w-0 items-center gap-2 border-b px-2.5 py-1.5 text-xs last:border-b-0"
              >
                <FileIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate font-mono text-foreground/80">{path}</span>
              </li>
            ))}
          </ul>
        </ToolField>
      ) : null}
      <ToolField label={t("instructions")}>
        <SkillInstructions value={output.instructions} />
      </ToolField>
    </>
  );
}

const loadSkill = defineMaterial({
  tool: "loadSkill",
  icon: SparklesIcon,
  input: loadSkillInputSchema,
  output: loadSkillOutputSchema,
  summary: (_, { input, output }) =>
    output
      ? [output.id, output.version && `v${output.version}`].filter(Boolean).join(" · ")
      : input?.skillId,
  detail: LoadSkillDetail,
});

type ReadResourceProps = MaterialContext<
  z.infer<typeof readSkillResourceInputSchema>,
  z.infer<typeof readSkillResourceOutputSchema>
>;

function ReadResourceDetail({ output }: ReadResourceProps) {
  return output ? <ToolExcerpt>{output.content}</ToolExcerpt> : null;
}

const readSkillResource = defineMaterial({
  tool: "readSkillResource",
  icon: FileCodeIcon,
  input: readSkillResourceInputSchema,
  output: readSkillResourceOutputSchema,
  summary: (_, { input }) => (input ? `${input.skillId}/${input.path}` : undefined),
  detail: ReadResourceDetail,
});

export default [loadSkill, readSkillResource];
