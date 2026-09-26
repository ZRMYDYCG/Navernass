"use client";

import { FileCodeIcon, SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import {
  loadSkillInputSchema,
  loadSkillOutputSchema,
  readSkillResourceInputSchema,
  readSkillResourceOutputSchema,
} from "@/schemas/agent-tool.schema";

import { ToolExcerpt, ToolField } from "../tool-shell";
import { defineTool, type ToolProps } from "./define";

type LoadSkillProps = ToolProps<
  z.infer<typeof loadSkillInputSchema>,
  z.infer<typeof loadSkillOutputSchema>
>;

function LoadSkillDetail({ output }: LoadSkillProps) {
  const t = useTranslations("agui.detail");
  if (!output) return null;
  return (
    <>
      {output.allowedTools.length ? (
        <ToolField label={t("allowedTools")}>
          <div className="flex flex-wrap gap-1">
            {output.allowedTools.map((name) => (
              <Badge key={name} variant="outline">
                {name}
              </Badge>
            ))}
          </div>
        </ToolField>
      ) : null}
      {output.resources.length ? (
        <ToolField label={t("resources")}>
          <ul className="flex flex-col gap-0.5 font-mono text-xs text-foreground/80">
            {output.resources.map((path) => (
              <li key={path} className="truncate">
                {path}
              </li>
            ))}
          </ul>
        </ToolField>
      ) : null}
      <ToolField label={t("instructions")}>
        <ToolExcerpt>{output.instructions}</ToolExcerpt>
      </ToolField>
    </>
  );
}

export const loadSkill = defineTool({
  icon: SparklesIcon,
  input: loadSkillInputSchema,
  output: loadSkillOutputSchema,
  summary: (_, { input, output }) =>
    output
      ? [output.id, output.version && `v${output.version}`].filter(Boolean).join(" ")
      : input?.skillId,
  Detail: LoadSkillDetail,
});

type ReadResourceProps = ToolProps<
  z.infer<typeof readSkillResourceInputSchema>,
  z.infer<typeof readSkillResourceOutputSchema>
>;

function ReadResourceDetail({ output }: ReadResourceProps) {
  return output ? <ToolExcerpt>{output.content}</ToolExcerpt> : null;
}

export const readSkillResource = defineTool({
  icon: FileCodeIcon,
  input: readSkillResourceInputSchema,
  output: readSkillResourceOutputSchema,
  summary: (_, { input }) => (input ? `${input.skillId}/${input.path}` : undefined),
  Detail: ReadResourceDetail,
});
